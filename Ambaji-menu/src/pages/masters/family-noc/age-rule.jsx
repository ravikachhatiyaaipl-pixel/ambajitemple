/***
 *  I3EMS - AMT ERP  |  NOC Age Rule (Family / NOC module)
 *  Configures the age band at which a family member requires an NOC. The periodic
 *  age check (gmc:family-noc-age-check / POST family-noc/run-age-check) uses these.
 */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const NOC_TYPES = [
  { v: "DEPENDENT_ADULT", l: "Dependent turned adult" },
  { v: "EMPLOYMENT", l: "Employment NOC" },
  { v: "HIGHER_STUDY", l: "Higher study NOC" },
  { v: "GENERAL", l: "General NOC" },
];

const NocAgeRule = () => (
  <EntityManager
    title="NOC Age Rule"
    subtitle="When a family member crosses the applicable age, an NOC requirement is raised · AMT"
    endpoint="family-noc/age-rule"
    idKey="NAR_Id"
    columns={[
      { key: "NAR_Name", label: "Rule" },
      { key: "NOC_Type", label: "NOC Type" },
      { key: "Min_Age", label: "Min Age" },
      { key: "Max_Age", label: "Max Age" },
      { key: "Is_Active", label: "Active", type: "bool" },
    ]}
    fields={[
      { key: "NAR_Name", label: "Rule Name", type: "text", required: true, full: true },
      { key: "Rela_Id", label: "Relationship (blank = any)", type: "lookup", endpoint: "lookup/relations" },
      { key: "Gender", label: "Gender (blank = any)", type: "select", options: [{ v: "male", l: "Male" }, { v: "female", l: "Female" }, { v: "other", l: "Other" }] },
      { key: "Min_Age", label: "Minimum Age (years)", type: "number", required: true },
      { key: "Max_Age", label: "Maximum Age (blank = no upper limit)", type: "number" },
      { key: "NOC_Type", label: "NOC Type", type: "select", options: NOC_TYPES, required: true },
      { key: "Purpose", label: "Purpose / Notes", type: "textarea", full: true },
      { key: "Is_Active", label: "Active", type: "bool", default: true },
    ]}
  />
);

export default NocAgeRule;

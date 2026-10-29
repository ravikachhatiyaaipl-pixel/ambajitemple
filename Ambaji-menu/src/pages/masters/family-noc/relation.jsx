/***
 *  I3EMS - AMT ERP  |  Relationship Master (Family / NOC module)
 *  Reuses relationship_master (Rela_Id). Additive screen; the existing
 *  employee-personal-masters relationship screen remains untouched.
 */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const RelationMaster = () => (
  <EntityManager
    title="Relationship Master"
    subtitle="Define relationships used when recording employee family members · AMT"
    endpoint="family-noc/relation"
    idKey="Rela_Id"
    columns={[
      { key: "Rela_Code", label: "Code" },
      { key: "Rela_Name", label: "Relationship" },
    ]}
    fields={[
      { key: "Rela_Code", label: "Relationship Code", type: "text", required: true },
      { key: "Rela_Name", label: "Relationship Name", type: "text", required: true },
    ]}
  />
);

export default RelationMaster;

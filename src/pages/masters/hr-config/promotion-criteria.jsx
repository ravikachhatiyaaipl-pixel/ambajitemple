/***  I3EMS - AMT ERP  |  Promotion Criteria Configuration  */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const PromotionCriteria = () => (
  <EntityManager
    title="Promotion Criteria Configuration"
    subtitle="Eligibility rules for promotion / DPC (service, APAR grade, exam, vacancy) · AMT"
    endpoint="svc/promotion-criteria"
    idKey="PCC_Id"
    columns={[
      { key: "PCC_Name", label: "Criteria" },
      { key: "Min_Service_Years", label: "Min Service (yr)" },
      { key: "Required_APAR_Grade", label: "APAR Grade" },
      { key: "Exam_Required", label: "Exam", type: "bool" },
      { key: "Vacancy_Based", label: "Vacancy", type: "bool" },
      { key: "Is_Active", label: "Active", type: "bool" },
    ]}
    fields={[
      { key: "PCC_Name", label: "Criteria Name", type: "text", required: true, full: true },
      { key: "Desg_From_Id", label: "From Designation", type: "lookup", endpoint: "svc/lookup/designations" },
      { key: "Desg_To_Id", label: "To Designation", type: "lookup", endpoint: "svc/lookup/designations" },
      { key: "Min_Service_Years", label: "Minimum Service (years)", type: "number" },
      { key: "Required_APAR_Grade", label: "Required APAR Grade", type: "text" },
      { key: "APAR_Years_Considered", label: "APAR Years Considered", type: "number", default: 3 },
      { key: "Exam_Required", label: "Departmental Exam Required", type: "bool" },
      { key: "Vacancy_Based", label: "Vacancy Based", type: "bool", default: true },
      { key: "Dpc_Required", label: "DPC Required", type: "bool", default: true },
      { key: "Description", label: "Description / Rule Notes", type: "textarea", full: true },
      { key: "Is_Active", label: "Active", type: "bool", default: true },
    ]}
  />
);

export default PromotionCriteria;

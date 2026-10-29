/**
 *  AMT I3EMS - Consolidated route registrations for ALL added screens.
 *  Location: src/pages/routes/AmtAllRoutes.jsx
 *
 *  Consolidated route registrations for Dashboards + new Masters/Reports screens
 *  that are not yet present in their dedicated route files. Every path here is
 *  IDENTICAL to the Menu_Links inserted into function_types (function_types_new_menu.sql), so the
 *  dynamic-menu link and the React route always match.
 *
 *  NOTE: Screens that already have a route in reportroutes.jsx or reportstdroutes.jsx
 *  were removed from here on 2026-08-19 to eliminate duplicate route registrations
 *  (same screen reachable at two different URLs). Do not re-add a path here if it
 *  already exists in masterroutes.jsx, reportroutes.jsx, or reportstdroutes.jsx.
 *
 *  USAGE (React Router v6) - inside your top-level <Routes>:
 *      import { amtAllRoutes } from "./pages/routes/AmtAllRoutes";
 *      <Routes>
 *        // ...your existing <Route> elements...
 *        {amtAllRoutes(user)}
 *      </Routes>
 *  amtAllRoutes(user) returns an array of <Route> elements (valid children of <Routes> in v6).
 */
import React from "react";
import { Route } from "react-router-dom";
import { lazy } from "react";

const Scr_DashboardsAudit_dashboard = lazy(() => import("../dashboards/audit-dashboard"));
const Scr_DashboardsBudget_dashboard = lazy(() => import("../dashboards/budget-dashboard"));
const Scr_DashboardsEstate_dashboard = lazy(() => import("../dashboards/estate-dashboard"));
const Scr_DashboardsExecutive_dashboard = lazy(() => import("../dashboards/executive-dashboard"));
const Scr_DashboardsFinance_dashboard = lazy(() => import("../dashboards/finance-dashboard"));
const Scr_DashboardsGrant_dashboard = lazy(() => import("../dashboards/grant-dashboard"));
const Scr_DashboardsHealth_dashboard = lazy(() => import("../dashboards/health-dashboard"));
const Scr_DashboardsHr_dashboard = lazy(() => import("../dashboards/hr-dashboard"));
const Scr_DashboardsPayroll_dashboard = lazy(() => import("../dashboards/payroll-dashboard"));
const Scr_DashboardsTender_dashboard = lazy(() => import("../dashboards/tender-dashboard"));
const Scr_DashboardsWorks_dashboard = lazy(() => import("../dashboards/works-dashboard"));
const Scr_MastersAppraisalApar_record = lazy(() => import("../masters/appraisal/apar-record"));
const Scr_MastersAppraisalApar_representation = lazy(() => import("../masters/appraisal/apar-representation"));
const Scr_MastersAppraisalAppraisal_cycle = lazy(() => import("../masters/appraisal/appraisal-cycle"));
const Scr_MastersAppraisalAttribute_master = lazy(() => import("../masters/appraisal/attribute-master"));
const Scr_MastersAssetAsset = lazy(() => import("../masters/asset/asset"));
const Scr_MastersAssetCategory = lazy(() => import("../masters/asset/category"));
const Scr_MastersAssetDisposal = lazy(() => import("../masters/asset/disposal"));
const Scr_MastersDisciplinaryAppeal = lazy(() => import("../masters/disciplinary/appeal"));
const Scr_MastersDisciplinaryCase = lazy(() => import("../masters/disciplinary/case"));
const Scr_MastersDisciplinaryCharge_sheet = lazy(() => import("../masters/disciplinary/charge-sheet"));
const Scr_MastersDisciplinaryFinding = lazy(() => import("../masters/disciplinary/finding"));
const Scr_MastersDisciplinaryInquiry_officer = lazy(() => import("../masters/disciplinary/inquiry-officer"));
const Scr_MastersDisciplinaryPenalty = lazy(() => import("../masters/disciplinary/penalty"));
const Scr_MastersDisciplinaryPenalty_master = lazy(() => import("../masters/disciplinary/penalty-master"));
const Scr_MastersDisciplinaryProceeding = lazy(() => import("../masters/disciplinary/proceeding"));
const Scr_MastersFin_complianceAudit_para = lazy(() => import("../masters/fin-compliance/audit-para"));
const Scr_MastersFin_complianceFc_grant = lazy(() => import("../masters/fin-compliance/fc-grant"));
const Scr_MastersFin_complianceFc_utilization = lazy(() => import("../masters/fin-compliance/fc-utilization"));
const Scr_MastersFin_complianceNote = lazy(() => import("../masters/fin-compliance/note"));
const Scr_MastersFin_compliancePolicy = lazy(() => import("../masters/fin-compliance/policy"));
const Scr_MastersFin_complianceTreasury_advice = lazy(() => import("../masters/fin-compliance/treasury-advice"));
const Scr_MastersFin_complianceTreasury_recon = lazy(() => import("../masters/fin-compliance/treasury-recon"));
const Scr_MastersFinMapping = lazy(() => import("../masters/fin/mapping"));
const Scr_MastersGstGst_rate = lazy(() => import("../masters/gst/gst-rate"));
const Scr_MastersGstHsn_sac = lazy(() => import("../masters/gst/hsn-sac"));
const Scr_MastersGstReturn = lazy(() => import("../masters/gst/return"));
const Scr_MastersGstTransaction = lazy(() => import("../masters/gst/transaction"));
const Scr_MastersHealthCertificate = lazy(() => import("../masters/health/certificate"));
const Scr_MastersLoan_mgmtDocument_submission = lazy(() => import("../masters/loan-mgmt/document-submission"));
const Scr_MastersLoan_mgmtEligibility_rule = lazy(() => import("../masters/loan-mgmt/eligibility-rule"));
const Scr_MastersLoan_mgmtForeclosure = lazy(() => import("../masters/loan-mgmt/foreclosure"));
const Scr_MastersLoan_mgmtGuarantor = lazy(() => import("../masters/loan-mgmt/guarantor"));
const Scr_MastersPayroll_extraArrear = lazy(() => import("../masters/payroll-extra/arrear"));
const Scr_MastersPayroll_extraIncrement = lazy(() => import("../masters/payroll-extra/increment"));
const Scr_MastersPayroll_extraLoan_recovery = lazy(() => import("../masters/payroll-extra/loan-recovery"));
const Scr_MastersPayroll_extraLoan_sanction = lazy(() => import("../masters/payroll-extra/loan-sanction"));
const Scr_MastersPayroll_extraPay_fixation = lazy(() => import("../masters/payroll-extra/pay-fixation"));
const Scr_MastersPayroll_extraRecovery_priority = lazy(() => import("../masters/payroll-extra/recovery-priority"));
const Scr_MastersPayroll_extraSupplementary_bill = lazy(() => import("../masters/payroll-extra/supplementary-bill"));
const Scr_MastersRecruitmentAdvertisement = lazy(() => import("../masters/recruitment/advertisement"));
const Scr_MastersRecruitmentAppointment_order = lazy(() => import("../masters/recruitment/appointment-order"));
const Scr_MastersRecruitmentInterview = lazy(() => import("../masters/recruitment/interview"));
const Scr_MastersRecruitmentJob_application = lazy(() => import("../masters/recruitment/job-application"));
const Scr_MastersRecruitmentJob_opening = lazy(() => import("../masters/recruitment/job-opening"));
const Scr_MastersRecruitmentJoining = lazy(() => import("../masters/recruitment/joining"));
const Scr_MastersRecruitmentLegal_heir = lazy(() => import("../masters/recruitment/legal-heir"));
const Scr_MastersRecruitmentManpower_requirement = lazy(() => import("../masters/recruitment/manpower-requirement"));
const Scr_MastersRecruitmentScrutiny = lazy(() => import("../masters/recruitment/scrutiny"));
const Scr_MastersRecruitmentSelection = lazy(() => import("../masters/recruitment/selection"));
const Scr_MastersShop_transferTransfer = lazy(() => import("../masters/shop-transfer/transfer"));
const Scr_MastersSystemNotification_templates = lazy(() => import("../masters/system/notification-templates"));
const Scr_MastersSystemPayment_gateway_config = lazy(() => import("../masters/system/payment-gateway-config"));
const Scr_MastersTp_extraDeputation = lazy(() => import("../masters/tp-extra/deputation"));
const Scr_MastersTp_extraMass_batch = lazy(() => import("../masters/tp-extra/mass-batch"));
const Scr_MastersTp_extraPromotion_eligibility = lazy(() => import("../masters/tp-extra/promotion-eligibility"));
const Scr_MastersTp_extraTransfer_eligibility = lazy(() => import("../masters/tp-extra/transfer-eligibility"));
const Scr_MastersTransfer_promotionPromotion_order = lazy(() => import("../masters/transfer-promotion/promotion-order"));
const Scr_MastersTransfer_promotionPromotion_proposal = lazy(() => import("../masters/transfer-promotion/promotion-proposal"));
const Scr_MastersTransfer_promotionSeniority_list = lazy(() => import("../masters/transfer-promotion/seniority-list"));
const Scr_MastersTransfer_promotionTransfer_order = lazy(() => import("../masters/transfer-promotion/transfer-order"));
const Scr_MastersTransfer_promotionTransfer_request = lazy(() => import("../masters/transfer-promotion/transfer-request"));
const Scr_ReportsAppraisalApar_register = lazy(() => import("../reports/appraisal/apar-register"));
const Scr_ReportsAppraisalGrading_summary = lazy(() => import("../reports/appraisal/grading-summary"));
const Scr_ReportsAppraisalPending_apar = lazy(() => import("../reports/appraisal/pending-apar"));
const Scr_ReportsAssetDepreciation_schedule = lazy(() => import("../reports/asset/depreciation-schedule"));
const Scr_ReportsAssetDisposal_register = lazy(() => import("../reports/asset/disposal-register"));
const Scr_ReportsAssetRegister = lazy(() => import("../reports/asset/register"));
const Scr_ReportsDisciplinaryPenalty_register = lazy(() => import("../reports/disciplinary/penalty-register"));
const Scr_ReportsDisciplinaryPending_inquiries = lazy(() => import("../reports/disciplinary/pending-inquiries"));
const Scr_ReportsDisciplinaryRegister = lazy(() => import("../reports/disciplinary/register"));
const Scr_ReportsFin_complianceAudit_register = lazy(() => import("../reports/fin-compliance/audit-register"));
const Scr_ReportsFin_complianceExceptions = lazy(() => import("../reports/fin-compliance/exceptions"));
const Scr_ReportsFin_complianceFc_lapse = lazy(() => import("../reports/fin-compliance/fc-lapse"));
const Scr_ReportsFin_complianceFc_register = lazy(() => import("../reports/fin-compliance/fc-register"));
const Scr_ReportsFin_complianceNotes = lazy(() => import("../reports/fin-compliance/notes"));
const Scr_ReportsFin_compliancePolicies = lazy(() => import("../reports/fin-compliance/policies"));
const Scr_ReportsFin_complianceReconciliation = lazy(() => import("../reports/fin-compliance/reconciliation"));
const Scr_ReportsFin_complianceTreasury_register = lazy(() => import("../reports/fin-compliance/treasury-register"));
const Scr_ReportsFinBalance_sheet = lazy(() => import("../reports/fin/balance-sheet"));
const Scr_ReportsFinBudget_vs_actual = lazy(() => import("../reports/fin/budget-vs-actual"));
const Scr_ReportsFinIncome_expenditure = lazy(() => import("../reports/fin/income-expenditure"));
const Scr_ReportsFinLedger_statement = lazy(() => import("../reports/fin/ledger-statement"));
const Scr_ReportsFinReceipts_payments = lazy(() => import("../reports/fin/receipts-payments"));
const Scr_ReportsFinTrial_balance = lazy(() => import("../reports/fin/trial-balance"));
const Scr_ReportsGstGstr3b_summary = lazy(() => import("../reports/gst/gstr3b-summary"));
const Scr_ReportsGstHsn_summary = lazy(() => import("../reports/gst/hsn-summary"));
const Scr_ReportsGstInward_register = lazy(() => import("../reports/gst/inward-register"));
const Scr_ReportsGstOutward_register = lazy(() => import("../reports/gst/outward-register"));
const Scr_ReportsHealthBirth_register = lazy(() => import("../reports/health/birth-register"));
const Scr_ReportsHealthDeath_register = lazy(() => import("../reports/health/death-register"));
const Scr_ReportsHealthMarriage_register = lazy(() => import("../reports/health/marriage-register"));
const Scr_ReportsLoan_mgmtForeclosure_register = lazy(() => import("../reports/loan-mgmt/foreclosure-register"));
const Scr_ReportsLoan_mgmtLoan_ledger = lazy(() => import("../reports/loan-mgmt/loan-ledger"));
const Scr_ReportsLoan_mgmtOutstanding_statement = lazy(() => import("../reports/loan-mgmt/outstanding-statement"));
const Scr_ReportsPayroll_extraIncrement_register = lazy(() => import("../reports/payroll-extra/increment-register"));
const Scr_ReportsPayroll_extraLoan_register = lazy(() => import("../reports/payroll-extra/loan-register"));
const Scr_ReportsPayroll_extraRepayment_schedule = lazy(() => import("../reports/payroll-extra/repayment-schedule"));
const Scr_ReportsRecruitmentRegister = lazy(() => import("../reports/recruitment/register"));
const Scr_ReportsShop_transferOutstanding_tenant = lazy(() => import("../reports/shop-transfer/outstanding-tenant"));
const Scr_ReportsShop_transferRegister = lazy(() => import("../reports/shop-transfer/register"));
const Scr_ReportsStatfinExpenditure_dept = lazy(() => import("../reports/statfin/expenditure-dept"));
const Scr_ReportsStatfinExpenditure_workorder = lazy(() => import("../reports/statfin/expenditure-workorder"));
const Scr_ReportsStatfinFees_charges = lazy(() => import("../reports/statfin/fees-charges"));
const Scr_ReportsStatfinLiabilities = lazy(() => import("../reports/statfin/liabilities"));
const Scr_ReportsStatfinMulti_bank = lazy(() => import("../reports/statfin/multi-bank"));
const Scr_ReportsStatfinPayment_control = lazy(() => import("../reports/statfin/payment-control"));
const Scr_ReportsStatfinSalary_abstract = lazy(() => import("../reports/statfin/salary-abstract"));
const Scr_ReportsStatfinTax_revenue = lazy(() => import("../reports/statfin/tax-revenue"));
const Scr_ReportsSystemNotification_log = lazy(() => import("../reports/system/notification-log"));
const Scr_ReportsSystemPayment_audit = lazy(() => import("../reports/system/payment-audit"));
const Scr_ReportsSystemPayment_receipts = lazy(() => import("../reports/system/payment-receipts"));
const Scr_ReportsTp_extraDeputation = lazy(() => import("../reports/tp-extra/deputation"));
const Scr_ReportsTp_extraMass_transfer = lazy(() => import("../reports/tp-extra/mass-transfer"));
const Scr_ReportsTransfer_promotionPosting_history = lazy(() => import("../reports/transfer-promotion/posting-history"));
const Scr_ReportsTransfer_promotionPromotion_register = lazy(() => import("../reports/transfer-promotion/promotion-register"));
const Scr_ReportsTransfer_promotionTransfer_register = lazy(() => import("../reports/transfer-promotion/transfer-register"));

export const amtAllRoutes = (user) => ([
  <Route key="dashboards/audit-dashboard" path="dashboards/audit-dashboard" element={<Scr_DashboardsAudit_dashboard user={user} />} />,
  <Route key="dashboards/budget-dashboard" path="dashboards/budget-dashboard" element={<Scr_DashboardsBudget_dashboard user={user} />} />,
  <Route key="dashboards/estate-dashboard" path="dashboards/estate-dashboard" element={<Scr_DashboardsEstate_dashboard user={user} />} />,
  <Route key="dashboards/executive-dashboard" path="dashboards/executive-dashboard" element={<Scr_DashboardsExecutive_dashboard user={user} />} />,
  <Route key="dashboards/finance-dashboard" path="dashboards/finance-dashboard" element={<Scr_DashboardsFinance_dashboard user={user} />} />,
  <Route key="dashboards/grant-dashboard" path="dashboards/grant-dashboard" element={<Scr_DashboardsGrant_dashboard user={user} />} />,
  <Route key="dashboards/health-dashboard" path="dashboards/health-dashboard" element={<Scr_DashboardsHealth_dashboard user={user} />} />,
  <Route key="dashboards/hr-dashboard" path="dashboards/hr-dashboard" element={<Scr_DashboardsHr_dashboard user={user} />} />,
  <Route key="dashboards/payroll-dashboard" path="dashboards/payroll-dashboard" element={<Scr_DashboardsPayroll_dashboard user={user} />} />,
  <Route key="dashboards/tender-dashboard" path="dashboards/tender-dashboard" element={<Scr_DashboardsTender_dashboard user={user} />} />,
  <Route key="dashboards/works-dashboard" path="dashboards/works-dashboard" element={<Scr_DashboardsWorks_dashboard user={user} />} />,
  <Route key="masters/appraisal/apar-record" path="masters/appraisal/apar-record" element={<Scr_MastersAppraisalApar_record user={user} />} />,
  <Route key="masters/appraisal/apar-representation" path="masters/appraisal/apar-representation" element={<Scr_MastersAppraisalApar_representation user={user} />} />,
  <Route key="masters/appraisal/appraisal-cycle" path="masters/appraisal/appraisal-cycle" element={<Scr_MastersAppraisalAppraisal_cycle user={user} />} />,
  <Route key="masters/appraisal/attribute-master" path="masters/appraisal/attribute-master" element={<Scr_MastersAppraisalAttribute_master user={user} />} />,
  <Route key="masters/asset/asset" path="masters/asset/asset" element={<Scr_MastersAssetAsset user={user} />} />,
  <Route key="masters/asset/category" path="masters/asset/category" element={<Scr_MastersAssetCategory user={user} />} />,
  <Route key="masters/asset/disposal" path="masters/asset/disposal" element={<Scr_MastersAssetDisposal user={user} />} />,
  <Route key="masters/disciplinary/appeal" path="masters/disciplinary/appeal" element={<Scr_MastersDisciplinaryAppeal user={user} />} />,
  <Route key="masters/disciplinary/case" path="masters/disciplinary/case" element={<Scr_MastersDisciplinaryCase user={user} />} />,
  <Route key="masters/disciplinary/charge-sheet" path="masters/disciplinary/charge-sheet" element={<Scr_MastersDisciplinaryCharge_sheet user={user} />} />,
  <Route key="masters/disciplinary/finding" path="masters/disciplinary/finding" element={<Scr_MastersDisciplinaryFinding user={user} />} />,
  <Route key="masters/disciplinary/inquiry-officer" path="masters/disciplinary/inquiry-officer" element={<Scr_MastersDisciplinaryInquiry_officer user={user} />} />,
  <Route key="masters/disciplinary/penalty" path="masters/disciplinary/penalty" element={<Scr_MastersDisciplinaryPenalty user={user} />} />,
  <Route key="masters/disciplinary/penalty-master" path="masters/disciplinary/penalty-master" element={<Scr_MastersDisciplinaryPenalty_master user={user} />} />,
  <Route key="masters/disciplinary/proceeding" path="masters/disciplinary/proceeding" element={<Scr_MastersDisciplinaryProceeding user={user} />} />,
  <Route key="masters/fin-compliance/audit-para" path="masters/fin-compliance/audit-para" element={<Scr_MastersFin_complianceAudit_para user={user} />} />,
  <Route key="masters/fin-compliance/fc-grant" path="masters/fin-compliance/fc-grant" element={<Scr_MastersFin_complianceFc_grant user={user} />} />,
  <Route key="masters/fin-compliance/fc-utilization" path="masters/fin-compliance/fc-utilization" element={<Scr_MastersFin_complianceFc_utilization user={user} />} />,
  <Route key="masters/fin-compliance/note" path="masters/fin-compliance/note" element={<Scr_MastersFin_complianceNote user={user} />} />,
  <Route key="masters/fin-compliance/policy" path="masters/fin-compliance/policy" element={<Scr_MastersFin_compliancePolicy user={user} />} />,
  <Route key="masters/fin-compliance/treasury-advice" path="masters/fin-compliance/treasury-advice" element={<Scr_MastersFin_complianceTreasury_advice user={user} />} />,
  <Route key="masters/fin-compliance/treasury-recon" path="masters/fin-compliance/treasury-recon" element={<Scr_MastersFin_complianceTreasury_recon user={user} />} />,
  <Route key="masters/fin/mapping" path="masters/fin/mapping" element={<Scr_MastersFinMapping user={user} />} />,
  <Route key="masters/gst/gst-rate" path="masters/gst/gst-rate" element={<Scr_MastersGstGst_rate user={user} />} />,
  <Route key="masters/gst/hsn-sac" path="masters/gst/hsn-sac" element={<Scr_MastersGstHsn_sac user={user} />} />,
  <Route key="masters/gst/return" path="masters/gst/return" element={<Scr_MastersGstReturn user={user} />} />,
  <Route key="masters/gst/transaction" path="masters/gst/transaction" element={<Scr_MastersGstTransaction user={user} />} />,
  <Route key="masters/health/certificate" path="masters/health/certificate" element={<Scr_MastersHealthCertificate user={user} />} />,
  <Route key="masters/loan-mgmt/document-submission" path="masters/loan-mgmt/document-submission" element={<Scr_MastersLoan_mgmtDocument_submission user={user} />} />,
  <Route key="masters/loan-mgmt/eligibility-rule" path="masters/loan-mgmt/eligibility-rule" element={<Scr_MastersLoan_mgmtEligibility_rule user={user} />} />,
  <Route key="masters/loan-mgmt/foreclosure" path="masters/loan-mgmt/foreclosure" element={<Scr_MastersLoan_mgmtForeclosure user={user} />} />,
  <Route key="masters/loan-mgmt/guarantor" path="masters/loan-mgmt/guarantor" element={<Scr_MastersLoan_mgmtGuarantor user={user} />} />,
  <Route key="masters/payroll-extra/arrear" path="masters/payroll-extra/arrear" element={<Scr_MastersPayroll_extraArrear user={user} />} />,
  <Route key="masters/payroll-extra/increment" path="masters/payroll-extra/increment" element={<Scr_MastersPayroll_extraIncrement user={user} />} />,
  <Route key="masters/payroll-extra/loan-recovery" path="masters/payroll-extra/loan-recovery" element={<Scr_MastersPayroll_extraLoan_recovery user={user} />} />,
  <Route key="masters/payroll-extra/loan-sanction" path="masters/payroll-extra/loan-sanction" element={<Scr_MastersPayroll_extraLoan_sanction user={user} />} />,
  <Route key="masters/payroll-extra/pay-fixation" path="masters/payroll-extra/pay-fixation" element={<Scr_MastersPayroll_extraPay_fixation user={user} />} />,
  <Route key="masters/payroll-extra/recovery-priority" path="masters/payroll-extra/recovery-priority" element={<Scr_MastersPayroll_extraRecovery_priority user={user} />} />,
  <Route key="masters/payroll-extra/supplementary-bill" path="masters/payroll-extra/supplementary-bill" element={<Scr_MastersPayroll_extraSupplementary_bill user={user} />} />,
  <Route key="masters/recruitment/advertisement" path="masters/recruitment/advertisement" element={<Scr_MastersRecruitmentAdvertisement user={user} />} />,
  <Route key="masters/recruitment/appointment-order" path="masters/recruitment/appointment-order" element={<Scr_MastersRecruitmentAppointment_order user={user} />} />,
  <Route key="masters/recruitment/interview" path="masters/recruitment/interview" element={<Scr_MastersRecruitmentInterview user={user} />} />,
  <Route key="masters/recruitment/job-application" path="masters/recruitment/job-application" element={<Scr_MastersRecruitmentJob_application user={user} />} />,
  <Route key="masters/recruitment/job-opening" path="masters/recruitment/job-opening" element={<Scr_MastersRecruitmentJob_opening user={user} />} />,
  <Route key="masters/recruitment/joining" path="masters/recruitment/joining" element={<Scr_MastersRecruitmentJoining user={user} />} />,
  <Route key="masters/recruitment/legal-heir" path="masters/recruitment/legal-heir" element={<Scr_MastersRecruitmentLegal_heir user={user} />} />,
  <Route key="masters/recruitment/manpower-requirement" path="masters/recruitment/manpower-requirement" element={<Scr_MastersRecruitmentManpower_requirement user={user} />} />,
  <Route key="masters/recruitment/scrutiny" path="masters/recruitment/scrutiny" element={<Scr_MastersRecruitmentScrutiny user={user} />} />,
  <Route key="masters/recruitment/selection" path="masters/recruitment/selection" element={<Scr_MastersRecruitmentSelection user={user} />} />,
  <Route key="masters/shop-transfer/transfer" path="masters/shop-transfer/transfer" element={<Scr_MastersShop_transferTransfer user={user} />} />,
  <Route key="masters/system/notification-templates" path="masters/system/notification-templates" element={<Scr_MastersSystemNotification_templates user={user} />} />,
  <Route key="masters/system/payment-gateway-config" path="masters/system/payment-gateway-config" element={<Scr_MastersSystemPayment_gateway_config user={user} />} />,
  <Route key="masters/tp-extra/deputation" path="masters/tp-extra/deputation" element={<Scr_MastersTp_extraDeputation user={user} />} />,
  <Route key="masters/tp-extra/mass-batch" path="masters/tp-extra/mass-batch" element={<Scr_MastersTp_extraMass_batch user={user} />} />,
  <Route key="masters/tp-extra/promotion-eligibility" path="masters/tp-extra/promotion-eligibility" element={<Scr_MastersTp_extraPromotion_eligibility user={user} />} />,
  <Route key="masters/tp-extra/transfer-eligibility" path="masters/tp-extra/transfer-eligibility" element={<Scr_MastersTp_extraTransfer_eligibility user={user} />} />,
  <Route key="masters/transfer-promotion/promotion-order" path="masters/transfer-promotion/promotion-order" element={<Scr_MastersTransfer_promotionPromotion_order user={user} />} />,
  <Route key="masters/transfer-promotion/promotion-proposal" path="masters/transfer-promotion/promotion-proposal" element={<Scr_MastersTransfer_promotionPromotion_proposal user={user} />} />,
  <Route key="masters/transfer-promotion/seniority-list" path="masters/transfer-promotion/seniority-list" element={<Scr_MastersTransfer_promotionSeniority_list user={user} />} />,
  <Route key="masters/transfer-promotion/transfer-order" path="masters/transfer-promotion/transfer-order" element={<Scr_MastersTransfer_promotionTransfer_order user={user} />} />,
  <Route key="masters/transfer-promotion/transfer-request" path="masters/transfer-promotion/transfer-request" element={<Scr_MastersTransfer_promotionTransfer_request user={user} />} />,
  <Route key="reports/appraisal/apar-register" path="reports/appraisal/apar-register" element={<Scr_ReportsAppraisalApar_register user={user} />} />,
  <Route key="reports/appraisal/grading-summary" path="reports/appraisal/grading-summary" element={<Scr_ReportsAppraisalGrading_summary user={user} />} />,
  <Route key="reports/appraisal/pending-apar" path="reports/appraisal/pending-apar" element={<Scr_ReportsAppraisalPending_apar user={user} />} />,
  <Route key="reports/asset/depreciation-schedule" path="reports/asset/depreciation-schedule" element={<Scr_ReportsAssetDepreciation_schedule user={user} />} />,
  <Route key="reports/asset/disposal-register" path="reports/asset/disposal-register" element={<Scr_ReportsAssetDisposal_register user={user} />} />,
  <Route key="reports/asset/register" path="reports/asset/register" element={<Scr_ReportsAssetRegister user={user} />} />,
  <Route key="reports/disciplinary/penalty-register" path="reports/disciplinary/penalty-register" element={<Scr_ReportsDisciplinaryPenalty_register user={user} />} />,
  <Route key="reports/disciplinary/pending-inquiries" path="reports/disciplinary/pending-inquiries" element={<Scr_ReportsDisciplinaryPending_inquiries user={user} />} />,
  <Route key="reports/disciplinary/register" path="reports/disciplinary/register" element={<Scr_ReportsDisciplinaryRegister user={user} />} />,
  <Route key="reports/fin-compliance/audit-register" path="reports/fin-compliance/audit-register" element={<Scr_ReportsFin_complianceAudit_register user={user} />} />,
  <Route key="reports/fin-compliance/exceptions" path="reports/fin-compliance/exceptions" element={<Scr_ReportsFin_complianceExceptions user={user} />} />,
  <Route key="reports/fin-compliance/fc-lapse" path="reports/fin-compliance/fc-lapse" element={<Scr_ReportsFin_complianceFc_lapse user={user} />} />,
  <Route key="reports/fin-compliance/fc-register" path="reports/fin-compliance/fc-register" element={<Scr_ReportsFin_complianceFc_register user={user} />} />,
  <Route key="reports/fin-compliance/notes" path="reports/fin-compliance/notes" element={<Scr_ReportsFin_complianceNotes user={user} />} />,
  <Route key="reports/fin-compliance/policies" path="reports/fin-compliance/policies" element={<Scr_ReportsFin_compliancePolicies user={user} />} />,
  <Route key="reports/fin-compliance/reconciliation" path="reports/fin-compliance/reconciliation" element={<Scr_ReportsFin_complianceReconciliation user={user} />} />,
  <Route key="reports/fin-compliance/treasury-register" path="reports/fin-compliance/treasury-register" element={<Scr_ReportsFin_complianceTreasury_register user={user} />} />,
  <Route key="reports/fin/balance-sheet" path="reports/fin/balance-sheet" element={<Scr_ReportsFinBalance_sheet user={user} />} />,
  <Route key="reports/fin/budget-vs-actual" path="reports/fin/budget-vs-actual" element={<Scr_ReportsFinBudget_vs_actual user={user} />} />,
  <Route key="reports/fin/income-expenditure" path="reports/fin/income-expenditure" element={<Scr_ReportsFinIncome_expenditure user={user} />} />,
  <Route key="reports/fin/ledger-statement" path="reports/fin/ledger-statement" element={<Scr_ReportsFinLedger_statement user={user} />} />,
  <Route key="reports/fin/receipts-payments" path="reports/fin/receipts-payments" element={<Scr_ReportsFinReceipts_payments user={user} />} />,
  <Route key="reports/fin/trial-balance" path="reports/fin/trial-balance" element={<Scr_ReportsFinTrial_balance user={user} />} />,
  <Route key="reports/gst/gstr3b-summary" path="reports/gst/gstr3b-summary" element={<Scr_ReportsGstGstr3b_summary user={user} />} />,
  <Route key="reports/gst/hsn-summary" path="reports/gst/hsn-summary" element={<Scr_ReportsGstHsn_summary user={user} />} />,
  <Route key="reports/gst/inward-register" path="reports/gst/inward-register" element={<Scr_ReportsGstInward_register user={user} />} />,
  <Route key="reports/gst/outward-register" path="reports/gst/outward-register" element={<Scr_ReportsGstOutward_register user={user} />} />,
  <Route key="reports/health/birth-register" path="reports/health/birth-register" element={<Scr_ReportsHealthBirth_register user={user} />} />,
  <Route key="reports/health/death-register" path="reports/health/death-register" element={<Scr_ReportsHealthDeath_register user={user} />} />,
  <Route key="reports/health/marriage-register" path="reports/health/marriage-register" element={<Scr_ReportsHealthMarriage_register user={user} />} />,
  <Route key="reports/loan-mgmt/foreclosure-register" path="reports/loan-mgmt/foreclosure-register" element={<Scr_ReportsLoan_mgmtForeclosure_register user={user} />} />,
  <Route key="reports/loan-mgmt/loan-ledger" path="reports/loan-mgmt/loan-ledger" element={<Scr_ReportsLoan_mgmtLoan_ledger user={user} />} />,
  <Route key="reports/loan-mgmt/outstanding-statement" path="reports/loan-mgmt/outstanding-statement" element={<Scr_ReportsLoan_mgmtOutstanding_statement user={user} />} />,
  <Route key="reports/payroll-extra/increment-register" path="reports/payroll-extra/increment-register" element={<Scr_ReportsPayroll_extraIncrement_register user={user} />} />,
  <Route key="reports/payroll-extra/loan-register" path="reports/payroll-extra/loan-register" element={<Scr_ReportsPayroll_extraLoan_register user={user} />} />,
  <Route key="reports/payroll-extra/repayment-schedule" path="reports/payroll-extra/repayment-schedule" element={<Scr_ReportsPayroll_extraRepayment_schedule user={user} />} />,
  <Route key="reports/recruitment/register" path="reports/recruitment/register" element={<Scr_ReportsRecruitmentRegister user={user} />} />,
  <Route key="reports/shop-transfer/outstanding-tenant" path="reports/shop-transfer/outstanding-tenant" element={<Scr_ReportsShop_transferOutstanding_tenant user={user} />} />,
  <Route key="reports/shop-transfer/register" path="reports/shop-transfer/register" element={<Scr_ReportsShop_transferRegister user={user} />} />,
  <Route key="reports/statfin/expenditure-dept" path="reports/statfin/expenditure-dept" element={<Scr_ReportsStatfinExpenditure_dept user={user} />} />,
  <Route key="reports/statfin/expenditure-workorder" path="reports/statfin/expenditure-workorder" element={<Scr_ReportsStatfinExpenditure_workorder user={user} />} />,
  <Route key="reports/statfin/fees-charges" path="reports/statfin/fees-charges" element={<Scr_ReportsStatfinFees_charges user={user} />} />,
  <Route key="reports/statfin/liabilities" path="reports/statfin/liabilities" element={<Scr_ReportsStatfinLiabilities user={user} />} />,
  <Route key="reports/statfin/multi-bank" path="reports/statfin/multi-bank" element={<Scr_ReportsStatfinMulti_bank user={user} />} />,
  <Route key="reports/statfin/payment-control" path="reports/statfin/payment-control" element={<Scr_ReportsStatfinPayment_control user={user} />} />,
  <Route key="reports/statfin/salary-abstract" path="reports/statfin/salary-abstract" element={<Scr_ReportsStatfinSalary_abstract user={user} />} />,
  <Route key="reports/statfin/tax-revenue" path="reports/statfin/tax-revenue" element={<Scr_ReportsStatfinTax_revenue user={user} />} />,
  <Route key="reports/system/notification-log" path="reports/system/notification-log" element={<Scr_ReportsSystemNotification_log user={user} />} />,
  <Route key="reports/system/payment-audit" path="reports/system/payment-audit" element={<Scr_ReportsSystemPayment_audit user={user} />} />,
  <Route key="reports/system/payment-receipts" path="reports/system/payment-receipts" element={<Scr_ReportsSystemPayment_receipts user={user} />} />,
  <Route key="reports/tp-extra/deputation" path="reports/tp-extra/deputation" element={<Scr_ReportsTp_extraDeputation user={user} />} />,
  <Route key="reports/tp-extra/mass-transfer" path="reports/tp-extra/mass-transfer" element={<Scr_ReportsTp_extraMass_transfer user={user} />} />,
  <Route key="reports/transfer-promotion/posting-history" path="reports/transfer-promotion/posting-history" element={<Scr_ReportsTransfer_promotionPosting_history user={user} />} />,
  <Route key="reports/transfer-promotion/promotion-register" path="reports/transfer-promotion/promotion-register" element={<Scr_ReportsTransfer_promotionPromotion_register user={user} />} />,
  <Route key="reports/transfer-promotion/transfer-register" path="reports/transfer-promotion/transfer-register" element={<Scr_ReportsTransfer_promotionTransfer_register user={user} />} />,
]);

export default amtAllRoutes;

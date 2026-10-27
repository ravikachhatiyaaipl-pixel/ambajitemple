import React from "react";
import { Route, Routes } from "react-router-dom";
import { lazy } from "react";

// =====================================================================
// PHASE 2: CASH/BANK & CORE LEDGER
// =====================================================================
const DonationReports = lazy(() => import("../reports/donation"));
const ChequeRegister = lazy(() => import("../reports/cash-bank/cheque-register"));
const BankReconciliation = lazy(() => import("../reports/cash-bank/bank-reconciliation"));
const VendorTds = lazy(() => import("../reports/core-ledger/vendor-tds-summary"));

// =====================================================================
// PHASE 3: HR REPORTS
// =====================================================================
const EmployeeMasterRegister = lazy(() => import("../reports/hr/employee-master-register"));
const MonthlyPayrollRegister = lazy(() => import("../reports/hr/monthly-payroll-register"));
const PayBillSummary = lazy(() => import("../reports/hr/pay-bill-summary"));
const LeaveBalance = lazy(() => import("../reports/hr/leave-balance"));
const LeaveRegister = lazy(() => import("../reports/hr/leave-register"));
const AttendanceMuster = lazy(() => import("../reports/hr/attendance-muster"));
const Absenteeism = lazy(() => import("../reports/hr/absenteeism"));
const RetirementDue = lazy(() => import("../reports/hr/retirement-due"));
const OvertimeRegister = lazy(() => import("../reports/hr/overtime-register"));

// =====================================================================
// PHASE 4: WORKS & ADMIN REPORTS
// =====================================================================
const WorkOrderRegister = lazy(() => import("../reports/works/work-order-register"));
const WorksFinancialSummary = lazy(() => import("../reports/works/financial-summary"));
const WorkBgRegister = lazy(() => import("../reports/works/work-bg-register"));
const TenderAdjustments = lazy(() => import("../reports/works/tender-adjustments"));
const RoleMasterReport = lazy(() => import("../reports/admin/role-master-report"));
const FunctionTypeReport = lazy(() => import("../reports/admin/function-type-report"));
const DeptMenuMapReport = lazy(() => import("../reports/admin/dept-menu-map-report"));
const AuditLog = lazy(() => import("../reports/admin/audit-log"));

// =====================================================================
// PHASE 5: ESTATE, HEALTH & GRANT REPORTS
// =====================================================================
const HallBookingRegister = lazy(() => import("../reports/estate/hall-booking-register"));
const HallRevenue = lazy(() => import("../reports/estate/hall-revenue"));
const ShopRegister = lazy(() => import("../reports/estate/shop-register"));
const ShopRentCollection = lazy(() => import("../reports/estate/shop-rent-collection"));
const AgreementsExpiring = lazy(() => import("../reports/estate/agreements-expiring"));
const CertificateTypes = lazy(() => import("../reports/health/certificate-types"));
const CitizenRegister = lazy(() => import("../reports/health/citizen-register"));
const GrantRegister = lazy(() => import("../reports/grant/grant-register"));
const SchemeRegister = lazy(() => import("../reports/grant/scheme-register"));
const GrantSummaryByType = lazy(() => import("../reports/grant/grant-summary-by-type"));

// =====================================================================
// CORE LEDGER REPORTS (Additional)
// =====================================================================
const TrialBalance = lazy(() => import("../reports/core-ledger/trialbalance"));
const GstAmountReport = lazy(() => import("../reports/core-ledger/gst-amount"));
const SubLedger = lazy(() => import("../reports/core-ledger/subledger"));
const SubLedgerSummary = lazy(() => import("../reports/core-ledger/subledger-summary"));
const Ledger = lazy(() => import("../reports/core-ledger/ledger"));
const TrialDetail = lazy(() => import("../reports/core-ledger/trialdetail"));
const OpeningBalanceReg = lazy(() => import("../reports/core-ledger/openingbalance-reg"));
const Journal = lazy(() => import("../reports/core-ledger/journal"));
const Contra = lazy(() => import("../reports/core-ledger/contra"));
const TrialBalanceMatch = lazy(() => import("../reports/core-ledger/trialbalancematch"));
const SubLedgerBillSummeryReport = lazy(() => import("../reports/core-ledger/subledger-bill-summery-report"));

// =====================================================================
// BUDGET MANAGEMENT REPORTS
// =====================================================================
const DepartmentwiseBudgetSummary = lazy(() => import("../reports/budget-management/departmentwise-budget"));
const AccountwiseBudgetSummary = lazy(() => import("../reports/budget-management/accountwise-budget"));
const BudgetComparative = lazy(() => import("../reports/budget-management/comparative"));
const BudgetWorkPlanning = lazy(() => import("../reports/budget-management/workplanning"));
const RevisedBudget = lazy(() => import("../reports/budget-management/revised-budget"));
const BudgetUtilization = lazy(() => import("../reports/budget-management/utilization"));
const ConsolidatedBudgetReport = lazy(() => import("../reports/budget-management/consolidatedbudgetreport"));
const RevenueExpenseHierarchyReport = lazy(() => import("../reports/budget-management/revenue-expense-hierarchy-report"));
const BudgetApprovalStatusReport = lazy(() => import("../reports/budget-management/budget-approval-status-report"));
const BudgetComparison = lazy(() => import("../reports/budget-management/comparison"));
const RevenueIncome = lazy(() => import("../reports/budget-management/revenue-income"));
const CapitalIncome = lazy(() => import("../reports/budget-management/capital-income"));
const CapitalExpense = lazy(() => import("../reports/budget-management/capital-expense"));
const DepartmentViseBudgetUtilization = lazy(() => import("../reports/budget-management/department-vise-budget-utilization"));
const DepartmentBudgetSummary = lazy(() => import("../reports/budget-management/department-budget-summary"));

// =====================================================================
// TENDER MANAGEMENT REPORTS
// =====================================================================
const TenderRegister = lazy(() => import("../reports/tender-management/tender-register"));
const TenderAllocationReport = lazy(() => import("../reports/tender-management/tender-allocation"));
const VendorwiseReg = lazy(() => import("../reports/tender-management/vendorwise-reg"));
const OverBudgetedWorkOrder = lazy(() => import("../reports/tender-management/over-budgeted"));
const DepartmentwiseActiveWorkOrders = lazy(() => import("../reports/tender-management/departmentwise-active-wo"));
const PendingTender = lazy(() => import("../reports/tender-management/pending-tender"));
const ActiveWorkOrders = lazy(() => import("../reports/tender-management/active-wo"));
const EmdRegister = lazy(() => import("../reports/tender-management/emd-register"));
const BGRegister = lazy(() => import("../reports/tender-management/bg-register"));
const DepartmentwiseBGRegister = lazy(() => import("../reports/tender-management/departmentwise-bg-register"));
const DepartmentwiseEmdRegister = lazy(() => import("../reports/tender-management/departmentwise-emd-register"));

// =====================================================================
// ANNUAL FINANCIAL STATEMENTS
// =====================================================================
const IncomeExpenditure = lazy(() => import("../reports/annual-financial/income-expenditure"));
const BalanceSheet = lazy(() => import("../reports/annual-financial/balancesheet"));
const LiabilitiesRegister = lazy(() => import("../reports/annual-financial/liabilities-register"));
const ContingentLiabilities = lazy(() => import("../reports/annual-financial/contingent-liabilities"));
const AssetsRegisterSummary = lazy(() => import("../reports/annual-financial/assets-register-summary"));
const CashFlowStatement = lazy(() => import("../reports/annual-financial/cash-flow-statement"));
const ReceiptsPayment = lazy(() => import("../reports/annual-financial/receipts-payment"));

// =====================================================================
// CASH & BANK REPORTS (Additional)
// =====================================================================
const CashBookReport = lazy(() => import("../reports/cash-bank/cash-book"));
const BankBookReport = lazy(() => import("../reports/cash-bank/bank-book"));
const IncomeReport = lazy(() => import("../reports/cash-bank/income-report"));
const ExpenseReport = lazy(() => import("../reports/cash-bank/expense-report"));
const SummaryIncomeReport = lazy(() => import("../reports/cash-bank/summary-income-report"));
const SummaryExpenseReport = lazy(() => import("../reports/cash-bank/summary-expense-report"));
const ChallanStatusSummaryReport = lazy(() => import("../reports/cash-bank/challan-status-summary-report"));
const PaymentStatusReport = lazy(() => import("../reports/cash-bank/payment-status-report"));
const CheckDepositeSlipReport = lazy(() => import("../reports/cash-bank/check-deposite-slip-report"));
const DayBookReport = lazy(() => import("../reports/cash-bank/day-book-report"));
const DepartmentwiseCashbookReport = lazy(() => import("../reports/cash-bank/departmentwise-cashbook-report"));
const DymcApproval = lazy(() => import("../reports/cash-bank/dymc-approval-bill"));

// =====================================================================
// SALARY ACCOUNTING
// =====================================================================
const SalaryIncome = lazy(() => import("../reports/salary-accounting/salary-income"));
const SalaryDeduction = lazy(() => import("../reports/salary-accounting/salary-deduction"));

// =====================================================================
// LEAVE & ATTENDANCE
// =====================================================================
const EmployeeAttendance = lazy(() => import("../reports/leave-attendance/employee-attendance"));

// =====================================================================
// MASTER REPORTS
// =====================================================================
const ChallanTypeReport = lazy(() => import("../reports/master-reports/challan-type-report"));

// =====================================================================
// LISTING REPORTS
// =====================================================================
const Zone = lazy(() => import("../reports/listing/zone"));
const Ward = lazy(() => import("../reports/listing/ward"));
const Area = lazy(() => import("../reports/listing/area"));
const User = lazy(() => import("../reports/listing/user"));
const Ccc = lazy(() => import("../reports/listing/ccc"));
const Department = lazy(() => import("../reports/listing/department"));
const NocAlerts = lazy(() => import("../reports/family-noc/alerts"));
const FamilyMembersReport = lazy(() => import("../reports/family-noc/members"));
const PfRegister = lazy(() => import("../reports/statutory/pf"));
const EsiRegister = lazy(() => import("../reports/statutory/esi"));
const PtRegister = lazy(() => import("../reports/statutory/pt"));
const TdsRegister = lazy(() => import("../reports/statutory/tds"));
const LwfRegister = lazy(() => import("../reports/statutory/lwf"));
const GisRegister = lazy(() => import("../reports/statutory/gis"));
const NpsRegister = lazy(() => import("../reports/statutory/nps"));
const LicRegister = lazy(() => import("../reports/statutory/lic"));
const StatutorySummary = lazy(() => import("../reports/statutory/summary"));
const ServiceEventsReport = lazy(() => import("../reports/service-events/details"));

// =====================================================================
// REPORT ROUTES COMPONENT
// =====================================================================

const ReportRoutes = ({ user }) => {
  return (
    <Routes>

      {/* ===== PHASE 2: CASH/BANK & CORE LEDGER ===== */}
      <Route path="cash-bank/cheque-register" element={<ChequeRegister user={user} />} />
      <Route path="cash-bank/bank-reconciliation" element={<BankReconciliation user={user} />} />
      <Route path="core-ledger/vendor-tds-summary" element={<VendorTds user={user} />} />

      {/* ===== PHASE 3: HR REPORTS ===== */}
      <Route path="hr/employee-master-register" element={<EmployeeMasterRegister user={user} />} />
      <Route path="hr/monthly-payroll-register" element={<MonthlyPayrollRegister user={user} />} />
      <Route path="hr/pay-bill-summary" element={<PayBillSummary user={user} />} />
      <Route path="hr/leave-balance" element={<LeaveBalance user={user} />} />
      <Route path="hr/leave-register" element={<LeaveRegister user={user} />} />
      <Route path="hr/attendance-muster" element={<AttendanceMuster user={user} />} />
      <Route path="hr/absenteeism" element={<Absenteeism user={user} />} />
      <Route path="hr/retirement-due" element={<RetirementDue user={user} />} />
      <Route path="hr/overtime-register" element={<OvertimeRegister user={user} />} />

      {/* ===== PHASE 4: WORKS & ADMIN REPORTS ===== */}
      <Route path="works/work-order-register" element={<WorkOrderRegister user={user} />} />
      <Route path="works/financial-summary" element={<WorksFinancialSummary user={user} />} />
      <Route path="works/work-bg-register" element={<WorkBgRegister user={user} />} />
      <Route path="works/tender-adjustments" element={<TenderAdjustments user={user} />} />
      <Route path="admin/role-master-report" element={<RoleMasterReport user={user} />} />
      <Route path="admin/function-type-report" element={<FunctionTypeReport user={user} />} />
      <Route path="admin/dept-menu-map-report" element={<DeptMenuMapReport user={user} />} />
      <Route path="admin/audit-log" element={<AuditLog user={user} />} />

      {/* ===== PHASE 5: ESTATE, HEALTH & GRANT REPORTS ===== */}
      <Route path="estate/hall-booking-register" element={<HallBookingRegister user={user} />} />
      <Route path="estate/hall-revenue" element={<HallRevenue user={user} />} />
      <Route path="estate/shop-register" element={<ShopRegister user={user} />} />
      <Route path="estate/shop-rent-collection" element={<ShopRentCollection user={user} />} />
      <Route path="estate/agreements-expiring" element={<AgreementsExpiring user={user} />} />
      <Route path="health/certificate-types" element={<CertificateTypes user={user} />} />
      <Route path="health/citizen-register" element={<CitizenRegister user={user} />} />
      <Route path="grant/grant-register" element={<GrantRegister user={user} />} />
      <Route path="grant/scheme-register" element={<SchemeRegister user={user} />} />
      <Route path="grant/grant-summary-by-type" element={<GrantSummaryByType user={user} />} />

      {/* ===== MASTER REPORTS ===== */}
      <Route path="master-reports/challan-type-report" element={<ChallanTypeReport user={user} />} />

      {/* ===== CASH & BANK REPORTS ===== */}
      <Route path="cash-bank/dymc-approval-bill" element={<DymcApproval user={user} />} />
      <Route path="cash-bank/cash-book" element={<CashBookReport user={user} />} />
      <Route path="cash-bank/bank-book" element={<BankBookReport user={user} />} />
      <Route path="cash-bank/income-report" element={<IncomeReport user={user} />} />
      <Route path="cash-bank/expense-report" element={<ExpenseReport user={user} />} />
      <Route path="cash-bank/summary-income-report" element={<SummaryIncomeReport user={user} />} />
      <Route path="cash-bank/summary-expense-report" element={<SummaryExpenseReport user={user} />} />
      <Route path="cash-bank/challan-status-summary-report" element={<ChallanStatusSummaryReport user={user} />} />
      <Route path="cash-bank/payment-status-report" element={<PaymentStatusReport user={user} />} />
      <Route path="cash-bank/check-deposite-slip-report" element={<CheckDepositeSlipReport user={user} />} />
      <Route path="cash-bank/day-book-report" element={<DayBookReport user={user} />} />
      <Route path="cash-bank/departmentwise-cashbook-report" element={<DepartmentwiseCashbookReport user={user} />} />

      {/* ===== CORE LEDGER REPORTS ===== */}
      <Route path="core-ledger/trialbalance" element={<TrialBalance user={user} />} />
      <Route path="core-ledger/gst-amount" element={<GstAmountReport user={user} />} />
      <Route path="core-ledger/subledger-bill-summery-report" element={<SubLedgerBillSummeryReport user={user} />} />
      <Route path="core-ledger/trialbalancematch" element={<TrialBalanceMatch user={user} />} />
      <Route path="core-ledger/subledger" element={<SubLedger user={user} />} />
      <Route path="core-ledger/subledger-summary" element={<SubLedgerSummary user={user} />} />
      <Route path="core-ledger/ledger" element={<Ledger user={user} />} />
      <Route path="core-ledger/trialdetail" element={<TrialDetail user={user} />} />
      <Route path="core-ledger/openingbalance-reg" element={<OpeningBalanceReg user={user} />} />
      <Route path="core-ledger/journal" element={<Journal user={user} />} />
      <Route path="core-ledger/contra" element={<Contra user={user} />} />

      {/* ===== ANNUAL FINANCIAL STATEMENTS ===== */}
      <Route path="annual-financial/income-expenditure" element={<IncomeExpenditure user={user} />} />
      <Route path="annual-financial/balancesheet" element={<BalanceSheet user={user} />} />
      <Route path="annual-financial/liabilities-register" element={<LiabilitiesRegister user={user} />} />
      <Route path="annual-financial/contingent-liabilities" element={<ContingentLiabilities user={user} />} />
      <Route path="annual-financial/assets-register-summary" element={<AssetsRegisterSummary user={user} />} />
      <Route path="annual-financial/cash-flow-statement" element={<CashFlowStatement user={user} />} />
      <Route path="annual-financial/receipts-payment" element={<ReceiptsPayment user={user} />} />

      {/* ===== BUDGET MANAGEMENT REPORTS ===== */}
      <Route path="budget-management/budget-approval-status-report" element={<BudgetApprovalStatusReport user={user} />} />
      <Route path="budget-management/department-vise-budget-utilization" element={<DepartmentViseBudgetUtilization user={user} />} />
      <Route path="budget-management/department-budget-summary" element={<DepartmentBudgetSummary user={user} />} />
      <Route path="budget-management/departmentwise-budget" element={<DepartmentwiseBudgetSummary user={user} />} />
      <Route path="budget-management/consolidated-budget-report" element={<ConsolidatedBudgetReport user={user} />} />
      <Route path="budget-management/accountwise-budget" element={<AccountwiseBudgetSummary user={user} />} />
      <Route path="budget-management/comparative" element={<BudgetComparative user={user} />} />
      <Route path="budget-management/workplanning" element={<BudgetWorkPlanning user={user} />} />
      <Route path="budget-management/revised-budget" element={<RevisedBudget user={user} />} />
      <Route path="budget-management/utilization" element={<BudgetUtilization user={user} />} />
      <Route path="budget-management/revenue-expense-hierarchy" element={<RevenueExpenseHierarchyReport user={user} />} />
      <Route path="budget-management/revenue-income" element={<RevenueIncome user={user} />} />
      <Route path="budget-management/comparison" element={<BudgetComparison user={user} />} />
      <Route path="budget-management/capital-income" element={<CapitalIncome user={user} />} />
      <Route path="budget-management/capital-expense" element={<CapitalExpense user={user} />} />

      {/* ===== SALARY ACCOUNTING ===== */}
      <Route path="salary-accounting/salary-income" element={<SalaryIncome user={user} />} />
      <Route path="salary-accounting/salary-deduction" element={<SalaryDeduction user={user} />} />

      {/* ===== LEAVE AND ATTENDANCE ===== */}
      <Route path="leave-attendance/employee-attendance" element={<EmployeeAttendance user={user} />} />

      {/* ===== TENDER MANAGEMENT ===== */}
      <Route path="tender-management/departmentwise-bg-register" element={<DepartmentwiseBGRegister user={user} />} />
      <Route path="tender-management/bg-register" element={<BGRegister user={user} />} />
      <Route path="tender-management/tender-register" element={<TenderRegister user={user} />} />
      <Route path="tender-management/tender-allocation" element={<TenderAllocationReport user={user} />} />
      <Route path="tender-management/vendorwise-reg" element={<VendorwiseReg user={user} />} />
      <Route path="tender-management/over-budgeted" element={<OverBudgetedWorkOrder user={user} />} />
      <Route path="tender-management/pending-tender" element={<PendingTender user={user} />} />
      <Route path="tender-management/departmentwise-active-wo" element={<DepartmentwiseActiveWorkOrders user={user} />} />
      <Route path="tender-management/departmentwise-emd-register" element={<DepartmentwiseEmdRegister user={user} />} />
      <Route path="tender-management/active-wo" element={<ActiveWorkOrders user={user} />} />
      <Route path="tender-management/emd-register" element={<EmdRegister user={user} />} />

      {/* ===== LISTING REPORTS ===== */}
      <Route path="listing/zone" element={<Zone user={user} />} />
      <Route path="listing/ward" element={<Ward user={user} />} />
      <Route path="listing/area" element={<Area user={user} />} />
      <Route path="listing/user" element={<User user={user} />} />
      <Route path="listing/ccc" element={<Ccc user={user} />} />
      <Route path="listing/department" element={<Department user={user} />} />

      <Route path="family-noc/alerts"  element={<NocAlerts user={user} />} />
      <Route path="family-noc/members" element={<FamilyMembersReport user={user} />} />
      <Route path="statutory/pf"       element={<PfRegister user={user} />} />
      <Route path="statutory/esi"      element={<EsiRegister user={user} />} />
      <Route path="statutory/pt"       element={<PtRegister user={user} />} />
      <Route path="statutory/tds"      element={<TdsRegister user={user} />} />
      <Route path="statutory/lwf"      element={<LwfRegister user={user} />} />
      <Route path="statutory/gis"      element={<GisRegister user={user} />} />
      <Route path="statutory/nps"      element={<NpsRegister user={user} />} />
      <Route path="statutory/lic"      element={<LicRegister user={user} />} />
      <Route path="statutory/summary"  element={<StatutorySummary user={user} />} />
      <Route path="service-events/details" element={<ServiceEventsReport user={user} />} />
       
      <Route path="donation" element={<DonationReports user={user} />} />
    </Routes>
  );
};

export default ReportRoutes;
/***
 *  I3EMS - AMT ERP
 *  Standardized Reports route group (parallel rebuilds via ReportShell/AutoReport).
 *  Mount in mainroutes.jsx:
 *     <Route path="/reports-std/*" element={<ReportStdRoutes user={user} />} />
 *  Originals under /reports/* remain untouched.
 */
import React from "react";
import { Routes, Route } from "react-router-dom";
import { lazy } from "react";
const ListingAreaStd = lazy(() => import("../reports-std/listing/area"));
const ListingCccStd = lazy(() => import("../reports-std/listing/ccc"));
const ListingDepartmentStd = lazy(() => import("../reports-std/listing/department"));
const ListingUserStd = lazy(() => import("../reports-std/listing/user"));
const ListingWardStd = lazy(() => import("../reports-std/listing/ward"));
const ListingZoneStd = lazy(() => import("../reports-std/listing/zone"));
const LeaveAttendanceEmployeeAttendanceStd = lazy(() => import("../reports-std/leave-attendance/employee-attendance"));
const AnnualFinancialAssetsRegisterSummaryStd = lazy(() => import("../reports-std/annual-financial/assets-register-summary"));
const AnnualFinancialBalancesheetStd = lazy(() => import("../reports-std/annual-financial/balancesheet"));
const AnnualFinancialCashFlowStatementStd = lazy(() => import("../reports-std/annual-financial/cash-flow-statement"));
const AnnualFinancialContingentLiabilitiesStd = lazy(() => import("../reports-std/annual-financial/contingent-liabilities"));
const AnnualFinancialIncomeExpenditureStd = lazy(() => import("../reports-std/annual-financial/income-expenditure"));
const AnnualFinancialLiabilitiesRegisterStd = lazy(() => import("../reports-std/annual-financial/liabilities-register"));
const AnnualFinancialReceiptsPaymentStd = lazy(() => import("../reports-std/annual-financial/receipts-payment"));
const SalaryAccountingSalaryDeductionStd = lazy(() => import("../reports-std/salary-accounting/salary-deduction"));
const SalaryAccountingSalaryIncomeStd = lazy(() => import("../reports-std/salary-accounting/salary-income"));
const BudgetManagementAccountwiseBudgetStd = lazy(() => import("../reports-std/budget-management/accountwise-budget"));
const BudgetManagementBudgetApprovalStatusReportStd = lazy(() => import("../reports-std/budget-management/budget-approval-status-report"));
const BudgetManagementCapitalExpenseStd = lazy(() => import("../reports-std/budget-management/capital-expense"));
const BudgetManagementCapitalIncomeStd = lazy(() => import("../reports-std/budget-management/capital-income"));
const BudgetManagementComparativeStd = lazy(() => import("../reports-std/budget-management/comparative"));
const BudgetManagementComparisonStd = lazy(() => import("../reports-std/budget-management/comparison"));
const BudgetManagementConsolidatedbudgetreportStd = lazy(() => import("../reports-std/budget-management/consolidatedbudgetreport"));
const BudgetManagementDepartmentwiseBudgetStd = lazy(() => import("../reports-std/budget-management/departmentwise-budget"));
const BudgetManagementRevenueExpenseHierarchyReportStd = lazy(() => import("../reports-std/budget-management/revenue-expense-hierarchy-report"));
const BudgetManagementRevenueIncomeStd = lazy(() => import("../reports-std/budget-management/revenue-income"));
const BudgetManagementRevisedBudgetStd = lazy(() => import("../reports-std/budget-management/revised-budget"));
const BudgetManagementUtilizationStd = lazy(() => import("../reports-std/budget-management/utilization"));
const BudgetManagementWorkplanningStd = lazy(() => import("../reports-std/budget-management/workplanning"));
const TenderManagementActiveWoStd = lazy(() => import("../reports-std/tender-management/active-wo"));
const TenderManagementBgRegisterStd = lazy(() => import("../reports-std/tender-management/bg-register"));
const TenderManagementDepartmentwiseActiveWoStd = lazy(() => import("../reports-std/tender-management/departmentwise-active-wo"));
const TenderManagementDepartmentwiseBgRegisterStd = lazy(() => import("../reports-std/tender-management/departmentwise-bg-register"));
const TenderManagementDepartmentwiseEmdRegisterStd = lazy(() => import("../reports-std/tender-management/departmentwise-emd-register"));
const TenderManagementEmdRegisterStd = lazy(() => import("../reports-std/tender-management/emd-register"));
const TenderManagementOverBudgetedStd = lazy(() => import("../reports-std/tender-management/over-budgeted"));
const TenderManagementPendingTenderStd = lazy(() => import("../reports-std/tender-management/pending-tender"));
const TenderManagementTenderAllocationStd = lazy(() => import("../reports-std/tender-management/tender-allocation"));
const TenderManagementTenderRegisterStd = lazy(() => import("../reports-std/tender-management/tender-register"));
const TenderManagementVendorwiseRegStd = lazy(() => import("../reports-std/tender-management/vendorwise-reg"));
const CashBankBankBookStd = lazy(() => import("../reports-std/cash-bank/bank-book"));
const CashBankCashBookStd = lazy(() => import("../reports-std/cash-bank/cash-book"));
const CashBankChallanStatusSummaryReportStd = lazy(() => import("../reports-std/cash-bank/challan-status-summary-report"));
const CashBankCheckDepositeSlipReportStd = lazy(() => import("../reports-std/cash-bank/check-deposite-slip-report"));
const CashBankDayBookReportStd = lazy(() => import("../reports-std/cash-bank/day-book-report"));
const CashBankDepartmentwiseCashbookReportStd = lazy(() => import("../reports-std/cash-bank/departmentwise-cashbook-report"));
const CashBankDymcApprovalBillStd = lazy(() => import("../reports-std/cash-bank/dymc-approval-bill"));
const CashBankExpenseReportStd = lazy(() => import("../reports-std/cash-bank/expense-report"));
const CashBankIncomeReportStd = lazy(() => import("../reports-std/cash-bank/income-report"));
const CashBankPaymentStatusReportStd = lazy(() => import("../reports-std/cash-bank/payment-status-report"));
const CashBankSummaryExpenseReportStd = lazy(() => import("../reports-std/cash-bank/summary-expense-report"));
const CashBankSummaryIncomeReportStd = lazy(() => import("../reports-std/cash-bank/summary-income-report"));
const CoreLedgerContraStd = lazy(() => import("../reports-std/core-ledger/contra"));
const CoreLedgerJournalStd = lazy(() => import("../reports-std/core-ledger/journal"));
const CoreLedgerLedgerStd = lazy(() => import("../reports-std/core-ledger/ledger"));
const CoreLedgerOpeningbalanceRegStd = lazy(() => import("../reports-std/core-ledger/openingbalance-reg"));
const CoreLedgerSubledgerBillSummeryReportStd = lazy(() => import("../reports-std/core-ledger/subledger-bill-summery-report"));
const CoreLedgerSubledgerSummaryStd = lazy(() => import("../reports-std/core-ledger/subledger-summary"));
const CoreLedgerSubledgerStd = lazy(() => import("../reports-std/core-ledger/subledger"));
const CoreLedgerTrialbalanceStd = lazy(() => import("../reports-std/core-ledger/trialbalance"));
const CoreLedgerGstAmountStd = lazy(() => import("../reports-std/core-ledger/gst-amount"));
const CoreLedgerTrialbalancematchStd = lazy(() => import("../reports-std/core-ledger/trialbalancematch"));
const CoreLedgerTrialdetailStd = lazy(() => import("../reports-std/core-ledger/trialdetail"));

const ReportStdRoutes = ({ user }) => {
  return (
    <Routes>
      <Route path="listing/area" element={<ListingAreaStd user={user} />} />
      <Route path="listing/ccc" element={<ListingCccStd user={user} />} />
      <Route path="listing/department" element={<ListingDepartmentStd user={user} />} />
      <Route path="listing/user" element={<ListingUserStd user={user} />} />
      <Route path="listing/ward" element={<ListingWardStd user={user} />} />
      <Route path="listing/zone" element={<ListingZoneStd user={user} />} />
      <Route path="leave-attendance/employee-attendance" element={<LeaveAttendanceEmployeeAttendanceStd user={user} />} />
      <Route path="annual-financial/assets-register-summary" element={<AnnualFinancialAssetsRegisterSummaryStd user={user} />} />
      <Route path="annual-financial/balancesheet" element={<AnnualFinancialBalancesheetStd user={user} />} />
      <Route path="annual-financial/cash-flow-statement" element={<AnnualFinancialCashFlowStatementStd user={user} />} />
      <Route path="annual-financial/contingent-liabilities" element={<AnnualFinancialContingentLiabilitiesStd user={user} />} />
      <Route path="annual-financial/income-expenditure" element={<AnnualFinancialIncomeExpenditureStd user={user} />} />
      <Route path="annual-financial/liabilities-register" element={<AnnualFinancialLiabilitiesRegisterStd user={user} />} />
      <Route path="annual-financial/receipts-payment" element={<AnnualFinancialReceiptsPaymentStd user={user} />} />
      <Route path="salary-accounting/salary-deduction" element={<SalaryAccountingSalaryDeductionStd user={user} />} />
      <Route path="salary-accounting/salary-income" element={<SalaryAccountingSalaryIncomeStd user={user} />} />
      <Route path="budget-management/accountwise-budget" element={<BudgetManagementAccountwiseBudgetStd user={user} />} />
      <Route path="budget-management/budget-approval-status-report" element={<BudgetManagementBudgetApprovalStatusReportStd user={user} />} />
      <Route path="budget-management/capital-expense" element={<BudgetManagementCapitalExpenseStd user={user} />} />
      <Route path="budget-management/capital-income" element={<BudgetManagementCapitalIncomeStd user={user} />} />
      <Route path="budget-management/comparative" element={<BudgetManagementComparativeStd user={user} />} />
      <Route path="budget-management/comparison" element={<BudgetManagementComparisonStd user={user} />} />
      <Route path="budget-management/consolidatedbudgetreport" element={<BudgetManagementConsolidatedbudgetreportStd user={user} />} />
      <Route path="budget-management/departmentwise-budget" element={<BudgetManagementDepartmentwiseBudgetStd user={user} />} />
      <Route path="budget-management/revenue-expense-hierarchy-report" element={<BudgetManagementRevenueExpenseHierarchyReportStd user={user} />} />
      <Route path="budget-management/revenue-income" element={<BudgetManagementRevenueIncomeStd user={user} />} />
      <Route path="budget-management/revised-budget" element={<BudgetManagementRevisedBudgetStd user={user} />} />
      <Route path="budget-management/utilization" element={<BudgetManagementUtilizationStd user={user} />} />
      <Route path="budget-management/workplanning" element={<BudgetManagementWorkplanningStd user={user} />} />
      <Route path="tender-management/active-wo" element={<TenderManagementActiveWoStd user={user} />} />
      <Route path="tender-management/bg-register" element={<TenderManagementBgRegisterStd user={user} />} />
      <Route path="tender-management/departmentwise-active-wo" element={<TenderManagementDepartmentwiseActiveWoStd user={user} />} />
      <Route path="tender-management/departmentwise-bg-register" element={<TenderManagementDepartmentwiseBgRegisterStd user={user} />} />
      <Route path="tender-management/departmentwise-emd-register" element={<TenderManagementDepartmentwiseEmdRegisterStd user={user} />} />
      <Route path="tender-management/emd-register" element={<TenderManagementEmdRegisterStd user={user} />} />
      <Route path="tender-management/over-budgeted" element={<TenderManagementOverBudgetedStd user={user} />} />
      <Route path="tender-management/pending-tender" element={<TenderManagementPendingTenderStd user={user} />} />
      <Route path="tender-management/tender-allocation" element={<TenderManagementTenderAllocationStd user={user} />} />
      <Route path="tender-management/tender-register" element={<TenderManagementTenderRegisterStd user={user} />} />
      <Route path="tender-management/vendorwise-reg" element={<TenderManagementVendorwiseRegStd user={user} />} />
      <Route path="cash-bank/bank-book" element={<CashBankBankBookStd user={user} />} />
      <Route path="cash-bank/cash-book" element={<CashBankCashBookStd user={user} />} />
      <Route path="cash-bank/challan-status-summary-report" element={<CashBankChallanStatusSummaryReportStd user={user} />} />
      <Route path="cash-bank/check-deposite-slip-report" element={<CashBankCheckDepositeSlipReportStd user={user} />} />
      <Route path="cash-bank/day-book-report" element={<CashBankDayBookReportStd user={user} />} />
      <Route path="cash-bank/departmentwise-cashbook-report" element={<CashBankDepartmentwiseCashbookReportStd user={user} />} />
      <Route path="cash-bank/dymc-approval-bill" element={<CashBankDymcApprovalBillStd user={user} />} />
      <Route path="cash-bank/expense-report" element={<CashBankExpenseReportStd user={user} />} />
      <Route path="cash-bank/income-report" element={<CashBankIncomeReportStd user={user} />} />
      <Route path="cash-bank/payment-status-report" element={<CashBankPaymentStatusReportStd user={user} />} />
      <Route path="cash-bank/summary-expense-report" element={<CashBankSummaryExpenseReportStd user={user} />} />
      <Route path="cash-bank/summary-income-report" element={<CashBankSummaryIncomeReportStd user={user} />} />
      <Route path="core-ledger/contra" element={<CoreLedgerContraStd user={user} />} />
      <Route path="core-ledger/journal" element={<CoreLedgerJournalStd user={user} />} />
      <Route path="core-ledger/ledger" element={<CoreLedgerLedgerStd user={user} />} />
      <Route path="core-ledger/openingbalance-reg" element={<CoreLedgerOpeningbalanceRegStd user={user} />} />
      <Route path="core-ledger/subledger-bill-summery-report" element={<CoreLedgerSubledgerBillSummeryReportStd user={user} />} />
      <Route path="core-ledger/subledger-summary" element={<CoreLedgerSubledgerSummaryStd user={user} />} />
      <Route path="core-ledger/subledger" element={<CoreLedgerSubledgerStd user={user} />} />
      <Route path="core-ledger/trialbalance" element={<CoreLedgerTrialbalanceStd user={user} />} />
      <Route path="core-ledger/gst-amount" element={<CoreLedgerGstAmountStd user={user} />} />
      <Route path="core-ledger/trialbalancematch" element={<CoreLedgerTrialbalancematchStd user={user} />} />
      <Route path="core-ledger/trialdetail" element={<CoreLedgerTrialdetailStd user={user} />} />
    </Routes>
  );
};

export default ReportStdRoutes;

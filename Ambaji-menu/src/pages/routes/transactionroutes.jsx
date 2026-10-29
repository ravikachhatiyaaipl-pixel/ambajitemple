import { Routes, Route } from "react-router-dom";
import { useState, useEffect, lazy } from "react";
import axios from "axios";
const OpeningVoucherList = lazy(() => import("../transactions/bookkeeping-vouchers/opening-balance-entries/list"));
const CreateOpeningVoucher = lazy(() => import("../transactions/bookkeeping-vouchers/opening-balance-entries/add"));
const OpeningVoucherEdit = lazy(() => import("../transactions/bookkeeping-vouchers/opening-balance-entries/edit"));
const OpeningVoucherView = lazy(() => import("../transactions/bookkeeping-vouchers/opening-balance-entries/view"));
const EditBudgetApproveEntry = lazy(() => import("../transactions/budget-management/budgetapprovalsentry/edit"));
const BudgetApprovalsList = lazy(() => import("../transactions/budget-management/budgetapprovalsentry/list"));
const ViewBudgetApproveEntry = lazy(() => import("../transactions/budget-management/budgetapprovalsentry/view"));
const EditBudgetFreezeEntry = lazy(() => import("../transactions/budget-management/budgetfreeze/edit"));
const BudgetFreezeList = lazy(() => import("../transactions/budget-management/budgetfreeze/list"));
const ViewBudgetFreezeEntry = lazy(() => import("../transactions/budget-management/budgetfreeze/view"));
const AddEditBudgetEntry = lazy(() => import("../transactions/budget-management/budgetinitialentry/addedit"));
const BudgetInitialEntryList = lazy(() => import("../transactions/budget-management/budgetinitialentry/list"));
const ViewBudgetEntry = lazy(() => import("../transactions/budget-management/budgetinitialentry/view"));
const EditBudgetJustificationUploads = lazy(() => import("../transactions/budget-management/budgetjustificationuploads/edit"));
const BudgetJustificationUploadsList = lazy(() => import("../transactions/budget-management/budgetjustificationuploads/list"));
const ViewBudgetJustificationUploads = lazy(() => import("../transactions/budget-management/budgetjustificationuploads/view"));
const EditBudgetRevisedEntry = lazy(() => import("../transactions/budget-management/budgetrevisedentry/edit"));
const BudgetRevisedList = lazy(() => import("../transactions/budget-management/budgetrevisedentry/list"));
const ViewBudgetRevisedEntry = lazy(() => import("../transactions/budget-management/budgetrevisedentry/view"));
const AddEditTenderEntry = lazy(() => import("../transactions/tender-management/tenderentry/addedit"));
const TenderEntryList = lazy(() => import("../transactions/tender-management/tenderentry/list"));
const ViewTenderEntry = lazy(() => import("../transactions/tender-management/tenderentry/view"));
const AddEditTenderPenalty = lazy(() => import("../transactions/tender-management/tenderpenalty/addedit"));
const TenderPenaltyList = lazy(() => import("../transactions/tender-management/tenderpenalty/list"));
const ViewTenderPenalty = lazy(() => import("../transactions/tender-management/tenderpenalty/view"));
const AddEditWorkAllocation = lazy(() => import("../transactions/tender-management/workallocation/addedit"));
const WorkAllocationList = lazy(() => import("../transactions/tender-management/workallocation/list"));
const ViewWorkAllocation = lazy(() => import("../transactions/tender-management/workallocation/view"));
const ProfitLossPage = lazy(() => import("../transactions/profit-loss"));
const LedgerTransactionPage = lazy(() => import("../transactions/ledgertransaction"));
const DonationEntry = lazy(() => import("../transactions/donation/entry"));
const DonationApproval = lazy(() => import("../transactions/donation/approval"));
const DonationApprovalView = lazy(() => import("../transactions/donation/approval-view"));
const DonationList = lazy(() => import("../transactions/donation/list"));
const DonationStorageAllocation = lazy(() => import("../transactions/donation/storage-allocation"));
const ArticleDonationEntry = lazy(() => import("../transactions/article-donation/entry"));
const ArticleDonationList = lazy(() => import("../transactions/article-donation/list"));
const ArticleDonationApproval = lazy(() => import("../transactions/article-donation/approval"));
const ArticleDonationApprovalView = lazy(() => import("../transactions/article-donation/approval-view"));
const ArticleDonationReport = lazy(() => import("../transactions/article-donation/report"));
const PaymentVoucherList = lazy(() => import("../transactions/bookkeeping-vouchers/payment/list"));
const CreatePaymentVoucher = lazy(() => import("../transactions/bookkeeping-vouchers/payment/add"));
const PaymentVoucherEdit = lazy(() => import("../transactions/bookkeeping-vouchers/payment/edit"));
const PaymentVoucherView = lazy(() => import("../transactions/bookkeeping-vouchers/payment/view"));
const ReceiptVoucherList = lazy(() => import("../transactions/bookkeeping-vouchers/receipt/list"));
const CreateReceiptVoucher = lazy(() => import("../transactions/bookkeeping-vouchers/receipt/add"));
const ReceiptVoucherEdit = lazy(() => import("../transactions/bookkeeping-vouchers/receipt/edit"));
const ReceiptVoucherView = lazy(() => import("../transactions/bookkeeping-vouchers/receipt/view"));
const JournalVoucherList = lazy(() => import("../transactions/bookkeeping-vouchers/journal/list"));
const CreateJournalVoucher = lazy(() => import("../transactions/bookkeeping-vouchers/journal/add"));
const JournalVoucherEdit = lazy(() => import("../transactions/bookkeeping-vouchers/journal/edit"));
const JournalVoucherView = lazy(() => import("../transactions/bookkeeping-vouchers/journal/view"));
const ContraVoucherList = lazy(() => import("../transactions/bookkeeping-vouchers/contra/list"));
const CreateContraVoucher = lazy(() => import("../transactions/bookkeeping-vouchers/contra/add"));
const ContraVoucherEdit = lazy(() => import("../transactions/bookkeeping-vouchers/contra/edit"));
const ContraVoucherView = lazy(() => import("../transactions/bookkeeping-vouchers/contra/view"));
const AddEditBillChallanEntry = lazy(() => import("../transactions/vendor-payments/bill-challan-entry/addedit"));
const BillChallanEntryList = lazy(() => import("../transactions/vendor-payments/bill-challan-entry/list"));
const ViewBillChallanEntry = lazy(() => import("../transactions/vendor-payments/bill-challan-entry/view"));
const HodVerificationList = lazy(() => import("../transactions/vendor-payments/hod-verification/list"));
const ViewHodVerification = lazy(() => import("../transactions/vendor-payments/hod-verification/view"));
const AccountVerificationList = lazy(() => import("../transactions/vendor-payments/account-verification/list"));
const ViewAccountVerification = lazy(() => import("../transactions/vendor-payments/account-verification/view"));
const PaymentExecutionList = lazy(() => import("../transactions/vendor-payments/payment-execution/list"));
const ViewPaymentExecution = lazy(() => import("../transactions/vendor-payments/payment-execution/view"));
const ViewTenderPenaltyHodApproval = lazy(() => import("../transactions/tender-management/tenderpenalty-hod-approval/view"));
const TenderPenaltyHodApprovalList = lazy(() => import("../transactions/tender-management/tenderpenalty-hod-approval/list"));
const TenderEmdBgList = lazy(() => import("../transactions/tender-management/tender-emd-bg/list"));
const AddEditTenderEmdBg = lazy(() => import("../transactions/tender-management/tender-emd-bg/addedit"));
const ViewTenderEmdBg = lazy(() => import("../transactions/tender-management/tender-emd-bg/view"));
const TenderEmdBgHodApprovalList = lazy(() => import("../transactions/tender-management/tender-emd-bg-hod-approval/list"));
const ViewTenderEmdBgHodApproval = lazy(() => import("../transactions/tender-management/tender-emd-bg-hod-approval/view"));
const NocEntryList = lazy(() => import("../transactions/tender-management/tender-noc-entry/list"));
const AddEditNocEntry = lazy(() => import("../transactions/tender-management/tender-noc-entry/addedit"));
const ViewNocEntry = lazy(() => import("../transactions/tender-management/tender-noc-entry/view"));
const NocEntryHodApprovalList = lazy(() => import("../transactions/tender-management/tender-noc-hod-approval-entry/list"));
const ViewNocEntryHodApproval = lazy(() => import("../transactions/tender-management/tender-noc-hod-approval-entry/view"));
const WorkBgList = lazy(() => import("../transactions/tender-management/bg-receipt-entry/list"));
const ViewWorkBg = lazy(() => import("../transactions/tender-management/bg-receipt-entry/view"));
const AddEditWorkBg = lazy(() => import("../transactions/tender-management/bg-receipt-entry/addedit"));
const WorkBgHodApprovalList = lazy(() => import("../transactions/tender-management/bg-receipt-entry-hod-approval/list"));
const ViewWorkBgHodApproval = lazy(() => import("../transactions/tender-management/bg-receipt-entry-hod-approval/view"));
const AddEditTenderEmdRelease = lazy(() => import("../transactions/tender-management/tender-emd-release/addedit"));
const AddEditTenderBgRelease = lazy(() => import("../transactions/tender-management/tenderbgrelease/addedit"));
const ChallanVoucherList = lazy(() => import("../transactions/bookkeeping-vouchers/challan/list"));
const AddEditChallanVoucher = lazy(() => import("../transactions/bookkeeping-vouchers/challan/addedit"));
const ViewChallanVoucher = lazy(() => import("../transactions/bookkeeping-vouchers/challan/view"));
const ActionWorkList = lazy(() => import("../transactions/tender-management/action-work-order/list"));
const AddEditActionWork = lazy(() => import("../transactions/tender-management/action-work-order/addedit"));
const ViewActionWork = lazy(() => import("../transactions/tender-management/action-work-order/view"));
const ExpenseChallanVoucherList = lazy(() => import("../transactions/bookkeeping-vouchers/expense-challan/list"));
const AddEditExpenseChallanVoucher = lazy(() => import("../transactions/bookkeeping-vouchers/expense-challan/addedit"));
const ViewExpenseChallanVoucher = lazy(() => import("../transactions/bookkeeping-vouchers/expense-challan/view"));
const ListAttendanceRecord = lazy(() => import("../transactions/attendance-management/attendance/attendance-record-entry/list"));
const AddAttendanceRecord = lazy(() => import("../transactions/attendance-management/attendance/attendance-record-entry/addedit"));
const EditAttendanceRecord = lazy(() => import("../transactions/attendance-management/attendance/attendance-record-entry/edit"));
const ViewAttendanceRecord = lazy(() => import("../transactions/attendance-management/attendance/attendance-record-entry/view"));
const AddEditNewChallanUpdate = lazy(() => import("../transactions/bookkeeping-vouchers/new-challan-update/addedit"));
const NewChallanUpdateList = lazy(() => import("../transactions/bookkeeping-vouchers/new-challan-update/list"));
const ViewNewChallanUpdate = lazy(() => import("../transactions/bookkeeping-vouchers/new-challan-update/view"));
const AddEditNewExpenseChallanUpdate = lazy(() => import("../transactions/bookkeeping-vouchers/new-expense-challan-update/addedit"));
const NewExpenseChallanUpdateList = lazy(() => import("../transactions/bookkeeping-vouchers/new-expense-challan-update/list"));
const ViewNewExpenseChallanUpdate = lazy(() => import("../transactions/bookkeeping-vouchers/new-expense-challan-update/view"));
const OverTimeRecordList = lazy(() => import("../transactions/attendance-management/attendance/overtime-record-entry/list"));
const AddEditOverTimeRecord = lazy(() => import("../transactions/attendance-management/attendance/overtime-record-entry/addedit"));
const OverTimeRecordView = lazy(() => import("../transactions/attendance-management/attendance/overtime-record-entry/view"));
const OverTimeRecordHodApprovalList = lazy(() => import("../transactions/attendance-management/attendance/overtime-record-approval/list"));
const ViewOverTimeRecordHodApproval = lazy(() => import("../transactions/attendance-management/attendance/overtime-record-approval/view"));
const AddEditLeaveApplication = lazy(() => import("../transactions/attendance-management/leave/leave-application-entry/addedit"));
const LeaveApplicationView = lazy(() => import("../transactions/attendance-management/leave/leave-application-entry/view"));
const LeaveApplicationList = lazy(() => import("../transactions/attendance-management/leave/leave-application-entry/list"));
const LeaveApplicationApproval = lazy(() => import("../transactions/attendance-management/leave/leave-application-approval/list"));
const LeaveApplicationApprovalView = lazy(() => import("../transactions/attendance-management/leave/leave-application-approval/view"));
const AddEditManualAttendance = lazy(() => import("../transactions/attendance-management/attendance/manual-attendance-entry/addedit"));
const ManualAttendanceList = lazy(() => import("../transactions/attendance-management/attendance/manual-attendance-entry/list"));
const ManualAttendanceView = lazy(() => import("../transactions/attendance-management/attendance/manual-attendance-entry/view"));
const ManualAttendanceApproval = lazy(() => import("../transactions/attendance-management/attendance/manual-attendance-entry-approval/list"));
const ManualAttendanceApprovalView = lazy(() => import("../transactions/attendance-management/attendance/manual-attendance-entry-approval/view"));
const NewChallanApprovalView = lazy(() => import("../transactions/bookkeeping-vouchers/new-challan-update-approval/view"));
const NewChallanApprovalList = lazy(() => import("../transactions/bookkeeping-vouchers/new-challan-update-approval/list"));
const NewExpenseChallanApproval = lazy(() => import("../transactions/bookkeeping-vouchers/new-expense-challan-update-approval/list"));
const NewExpenseChallanApprovalView = lazy(() => import("../transactions/bookkeeping-vouchers/new-expense-challan-update-approval/view"));
const AddEditGrantEntry = lazy(() => import("../transactions/grant-management/grant-entry/addedit"));
const GrantEntryList = lazy(() => import("../transactions/grant-management/grant-entry/list"));
const GrantEntryView = lazy(() => import("../transactions/grant-management/grant-entry/view"));
const GrantEntryApprovalList = lazy(() => import("../transactions/grant-management/grant-entry-approval/list"));
const GrantEntryApprovalView = lazy(() => import("../transactions/grant-management/grant-entry-approval/view"));
const AddEditLeaveTransaction = lazy(() => import("../transactions/attendance-management/leave/leave-credit-entry/addedit"));
const LeaveTransactionList = lazy(() => import("../transactions/attendance-management/leave/leave-credit-entry/list"));
const LeaveTransactionView = lazy(() => import("../transactions/attendance-management/leave/leave-credit-entry/view"));
const AddEditLeaveRecall = lazy(() => import("../transactions/attendance-management/leave/leave-recall-entry/addedit"));
const LeaveRecallList = lazy(() => import("../transactions/attendance-management/leave/leave-recall-entry/list"));
const LeaveRecallView = lazy(() => import("../transactions/attendance-management/leave/leave-recall-entry/view"));
const LeaveRecallApproval = lazy(() => import("../transactions/attendance-management/leave/leave-recall-approval/list"));
const LeaveRecallApprovalView = lazy(() => import("../transactions/attendance-management/leave/leave-recall-approval/view"));
const AddEditLeaveCancel = lazy(() => import("../transactions/attendance-management/leave/leave-cancel-entry/addedit"));
const LeaveCancelList = lazy(() => import("../transactions/attendance-management/leave/leave-cancel-entry/list"));
const LeaveCancelView = lazy(() => import("../transactions/attendance-management/leave/leave-cancel-entry/view"));
const LeaveCancelApproval = lazy(() => import("../transactions/attendance-management/leave/leave-cancel-approval/list"));
const LeaveCancelApprovalView = lazy(() => import("../transactions/attendance-management/leave/leave-cancel-approval/view"));
const AddEditLeaveCarryForward = lazy(() => import("../transactions/attendance-management/leave/leave-carryforward-entry/addedit"));
const LeaveCarryForwardList = lazy(() => import("../transactions/attendance-management/leave/leave-carryforward-entry/list"));
const LeaveCarryForwardView = lazy(() => import("../transactions/attendance-management/leave/leave-carryforward-entry/view"));
const LeaveCarryForwardApproval = lazy(() => import("../transactions/attendance-management/leave/leave-carryforward-approval/list"));
const LeaveCarryForwardApprovalView = lazy(() => import("../transactions/attendance-management/leave/leave-carryforward-approval/view"));
const AddEditAttendanceRegularization = lazy(() => import("../transactions/attendance-management/attendance/attendance-regularization-entry/addedit"));
const AttendanceRegularizationList = lazy(() => import("../transactions/attendance-management/attendance/attendance-regularization-entry/list"));
const AttendanceRegularizationView = lazy(() => import("../transactions/attendance-management/attendance/attendance-regularization-entry/view"));
const AttendanceRegularizationApproval = lazy(() => import("../transactions/attendance-management/attendance/attendance-regularization-entry-approval/list"));
const AttendanceRegularizationApprovalView = lazy(() => import("../transactions/attendance-management/attendance/attendance-regularization-entry-approval/view"));
const ChequeVerifire = lazy(() => import("../transactions/bookkeeping-vouchers/cheque-verifiering/cheque-verifier"));
const CreateNewChallanUpdate = lazy(() => import("../transactions/bookkeeping-vouchers/new-challan-update/create"));
const CreateNewExpenseChallanUpdate = lazy(() => import("../transactions/bookkeeping-vouchers/new-expense-challan-update/create"));
const LeaveEncashmentList = lazy(() => import("../transactions/attendance-management/leave/leave-encashment/list"));
const AddEditLeaveEncashment = lazy(() => import("../transactions/attendance-management/leave/leave-encashment/addedit"));
const LeaveEncashmentView = lazy(() => import("../transactions/attendance-management/leave/leave-encashment/view"));
const BankTransactionList = lazy(() => import("../transactions/bookkeeping-vouchers/bank-transactions/list"));
const ViewBankTransaction = lazy(() => import("../transactions/bookkeeping-vouchers/bank-transactions/view"));
const ManagePayments = lazy(() => import("../transactions/bookkeeping-vouchers/manage-payment/list"));
const ManagePaymentsView = lazy(() => import("../transactions/bookkeeping-vouchers/manage-payment/view"));
const LedgerMappingList = lazy(() => import("../transactions/bookkeeping-vouchers/ledger-mapping-entry/list"));
const LedgerMappingAddEdit = lazy(() => import("../transactions/bookkeeping-vouchers/ledger-mapping-entry/addedit"));
const LedgerMappingView = lazy(() => import("../transactions/bookkeeping-vouchers/ledger-mapping-entry/view"));
const BgEntryList = lazy(() => import("../transactions/bookkeeping-vouchers/bg-entry/list"));
const BgEntryAddEdit = lazy(() => import("../transactions/bookkeeping-vouchers/bg-entry/addedit"));
const BgEntryView = lazy(() => import("../transactions/bookkeeping-vouchers/bg-entry/view"));
const ZoneCollectionList = lazy(() => import("../transactions/bookkeeping-vouchers/zone-wise-collection/list"));
const AddEditZoneCollection = lazy(() => import("../transactions/bookkeeping-vouchers/zone-wise-collection/addedit"));
const ZoneCollectionZoneView = lazy(() => import("../transactions/bookkeeping-vouchers/zone-wise-collection/zone"));
const FdRegisterList = lazy(() => import("../transactions/bookkeeping-vouchers/fd-register/list"));
const AddEditFdRegister = lazy(() => import("../transactions/bookkeeping-vouchers/fd-register/addedit"));
const ViewFdRegister = lazy(() => import("../transactions/bookkeeping-vouchers/fd-register/view"));
const SpecialDuty = lazy(() => import("../transactions/service-events/special-duty"));
const Award = lazy(() => import("../transactions/service-events/award"));
const SignificantWork = lazy(() => import("../transactions/service-events/significant-work"));
const Deputation = lazy(() => import("../transactions/service-events/deputation"));
const Posting = lazy(() => import("../transactions/service-events/posting"));
const HealthCertificate = lazy(() => import("../transactions/service-events/health-certificate"));
const MassAllotment = lazy(() => import("../transactions/service-events/mass-allotment"));

const TransactionsRoutes = ({ user }) => {
  const [ledgerGroupData, setLedgerGroupData] = useState([]);
  useEffect(() => {
    const fetchLedgerGroupData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/ledgers/all/data`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
        );
        console.log("response.data.data", response.data.data);

        if (response.data && response.data.data) {
          setLedgerGroupData(response.data.data);
        } else {
          setLedgerGroupData([]);
        }
      } catch (err) {
        console.error("Error fetching ledger group data:", err);
        setLedgerGroupData([]);
      }
    };
    fetchLedgerGroupData();
  }, []);

  return (
    <Routes>
      <Route path="profit-loss" element={<ProfitLossPage />} />
      <Route
        path="/:partyId"
        element={<LedgerTransactionPage ledgerGroupData={ledgerGroupData} />}
      />    

      <Route
        path="bookkeeping-vouchers/cheque-verifiering/cheque-verifier"
        element={<ChequeVerifire user={user} />}
      />

      <Route
        path="bookkeeping-vouchers/bank-transactions"
        element={<BankTransactionList user={user} />}
      />
      {/* <Route
        path="bookkeeping-vouchers/bank-transactions/create"
        element={<AddEditBankTransaction user={user} />}
      />
      <Route            
        path="bookkeeping-vouchers/bank-transactions/edit/:id"
        element={<AddEditBankTransaction user={user} />}
      /> */}
      <Route
        path="bookkeeping-vouchers/bank-transactions/view/:id"
        element={<ViewBankTransaction user={user} />}
      />

      <Route
        path="attendance-management/attendance/attendance-record-entry"
        element={<ListAttendanceRecord user={user} />}
      />
      <Route
        path="attendance-management/attendance/attendance-record-entry/create"
        element={<AddAttendanceRecord user={user} />}
      />
      <Route
        path="attendance-management/attendance/attendance-record-entry/edit/:id"
        element={<EditAttendanceRecord user={user} />}
      />
      <Route
        path="attendance-management/attendance/attendance-record-entry/view/:id"
        element={<ViewAttendanceRecord user={user} />}
      />
      <Route
        path="attendance-management/attendance/manual-attendance-entry"
        element={<ManualAttendanceList user={user} />}
      />
      <Route
        path="attendance-management/attendance/manual-attendance-entry/create"
        element={<AddEditManualAttendance user={user} />}
      />
      <Route
        path="attendance-management/attendance/manual-attendance-entry/edit/:id"
        element={<AddEditManualAttendance user={user} />}
      />
      <Route
        path="attendance-management/attendance/manual-attendance-entry/view/:id"
        element={<ManualAttendanceView user={user} />}
      />
      <Route
        path="attendance-management/attendance/manual-attendance-approval"
        element={<ManualAttendanceApproval user={user} />}
      />
      <Route
        path="attendance-management/attendance/manual-attendance-approval/view/:id"
        element={<ManualAttendanceApprovalView user={user} />}
      />
      //
      <Route
        path="attendance-management/attendance/attendance-regularization-entry"
        element={<AttendanceRegularizationList user={user} />}
      />
      <Route
        path="attendance-management/attendance/attendance-regularization-entry/create"
        element={<AddEditAttendanceRegularization user={user} />}
      />
      <Route
        path="attendance-management/attendance/attendance-regularization-entry/edit/:id"
        element={<AddEditAttendanceRegularization user={user} />}
      />
      <Route
        path="attendance-management/attendance/attendance-regularization-entry/view/:id"
        element={<AttendanceRegularizationView user={user} />}
      />
      <Route
        path="attendance-management/attendance/attendance-regularization-approval"
        element={<AttendanceRegularizationApproval user={user} />}
      />
      <Route
        path="attendance-management/attendance/attendance-regularization-approval/view/:id"
        element={<AttendanceRegularizationApprovalView user={user} />}
      />
      //
      <Route
        path="attendance-management/leave/leave-application-entry"
        element={<LeaveApplicationList user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-application-entry/create"
        element={<AddEditLeaveApplication user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-application-entry/edit/:id"
        element={<AddEditLeaveApplication user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-application-entry/view/:id"
        element={<LeaveApplicationView user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-application-approval"
        element={<LeaveApplicationApproval user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-application-approval/view/:id"
        element={<LeaveApplicationApprovalView user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-credits"
        element={<LeaveTransactionList user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-credits/create"
        element={<AddEditLeaveTransaction user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-credits/edit/:id"
        element={<AddEditLeaveTransaction user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-credits/view/:id"
        element={<LeaveTransactionView user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-recall-entry"
        element={<LeaveRecallList user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-recall-entry/create"
        element={<AddEditLeaveRecall user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-recall-entry/edit/:id"
        element={<AddEditLeaveRecall user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-recall-entry/view/:id"
        element={<LeaveRecallView user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-recall-approval"
        element={<LeaveRecallApproval user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-recall-approval/view/:id"
        element={<LeaveRecallApprovalView user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-cancel-entry"
        element={<LeaveCancelList user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-cancel-entry/create"
        element={<AddEditLeaveCancel user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-cancel-entry/edit/:id"
        element={<AddEditLeaveCancel user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-cancel-entry/view/:id"
        element={<LeaveCancelView user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-cancel-approval"
        element={<LeaveCancelApproval user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-cancel-approval/view/:id"
        element={<LeaveCancelApprovalView user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-carryforward-entry"
        element={<LeaveCarryForwardList user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-carryforward-entry/create"
        element={<AddEditLeaveCarryForward user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-carryforward-entry/edit/:id"
        element={<AddEditLeaveCarryForward user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-carryforward-entry/view/:id"
        element={<LeaveCarryForwardView user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-carryforward-approval"
        element={<LeaveCarryForwardApproval user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-carryforward-approval/view/:id"
        element={<LeaveCarryForwardApprovalView user={user} />}
      />

      <Route
        path="attendance-management/leave/leave-encashment"
        element={<LeaveEncashmentList user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-encashment/create"
        element={<AddEditLeaveEncashment user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-encashment/edit/:id"
        element={<AddEditLeaveEncashment user={user} />}
      />
      <Route
        path="attendance-management/leave/leave-encashment/view/:id"
        element={<LeaveEncashmentView user={user} />}
      />

      <Route
        path="attendance-management/attendance/overtime-record-entry"
        element={<OverTimeRecordList user={user} />}
      />
      <Route
        path="attendance-management/attendance/overtime-record-entry/create"
        element={<AddEditOverTimeRecord user={user} />}
      />
      <Route
        path="attendance-management/attendance/overtime-record-entry/edit/:id"
        element={<AddEditOverTimeRecord user={user} />}
      />
      <Route
        path="attendance-management/attendance/overtime-record-entry/view/:id"
        element={<OverTimeRecordView user={user} />}
      />
      <Route
        path="attendance-management/attendance/overtime-record-approval"
        element={<OverTimeRecordHodApprovalList user={user} />}
      />
      <Route
        path="attendance-management/attendance/overtime-record-approval/view/:id"
        element={<ViewOverTimeRecordHodApproval user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/opening-balance-entries"
        element={<OpeningVoucherList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/opening-balance-entries/create"
        element={<CreateOpeningVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/opening-balance-entries/edit/:id"
        element={<OpeningVoucherEdit user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/opening-balance-entries/view/:id"
        element={<OpeningVoucherView user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/payment-entries"
        element={<PaymentVoucherList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/payment-entries/create"
        element={<CreatePaymentVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/payment-entries/edit/:id"
        element={<PaymentVoucherEdit user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/payment-entries/view/:id"
        element={<PaymentVoucherView user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/receipt-entries"
        element={<ReceiptVoucherList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/receipt-entries/create"
        element={<CreateReceiptVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/receipt-entries/edit/:id"
        element={<ReceiptVoucherEdit user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/receipt-entries/view/:id"
        element={<ReceiptVoucherView user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/journal-entries"
        element={<JournalVoucherList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/journal-entries/create"
        element={<CreateJournalVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/journal-entries/edit/:id"
        element={<JournalVoucherEdit user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/journal-entries/view/:id"
        element={<JournalVoucherView user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/expense-challan"
        element={<ExpenseChallanVoucherList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/expense-challan/create"
        element={<AddEditExpenseChallanVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/expense-challan/edit/:id"
        element={<AddEditExpenseChallanVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/expense-challan/view/:id"
        element={<ViewExpenseChallanVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-challan-update"
        element={<NewChallanUpdateList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-challan-update/create"
        element={<CreateNewChallanUpdate user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-challan-update/edit/:id"
        element={<CreateNewChallanUpdate user={user} />}
      />
     
      <Route
        path="bookkeeping-vouchers/new-challan-update/create1"
        element={<CreateNewChallanUpdate user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-challan-update/edit1/:id"
        element={<CreateNewChallanUpdate user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-challan-update/view/:id"
        element={<ViewNewChallanUpdate user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-challan-approval"
        element={<NewChallanApprovalList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-challan-approval/view/:id"
        element={<NewChallanApprovalView user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-expense-challan-update"
        element={<NewExpenseChallanUpdateList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-expense-challan-update/create"
        element={<CreateNewExpenseChallanUpdate user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-expense-challan-update/edit/:id"
        element={<CreateNewExpenseChallanUpdate user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-expense-challan-update/edit1/:id"
        element={<CreateNewExpenseChallanUpdate user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-expense-challan-update/create1"
        element={<CreateNewExpenseChallanUpdate user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-expense-challan-update/view/:id"
        element={<ViewNewExpenseChallanUpdate user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-expense-challan-approval"
        element={<NewExpenseChallanApproval user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/new-expense-challan-approval/view/:id"
        element={<NewExpenseChallanApprovalView user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/manage-payments"
        element={<ManagePayments user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/manage-payments/view/:id"
        element={<ManagePaymentsView user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/ledger-mapping-entry"
        element={<LedgerMappingList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/ledger-mapping-entry/create"
        element={<LedgerMappingAddEdit user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/ledger-mapping-entry/edit/:id"
        element={<LedgerMappingAddEdit user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/ledger-mapping-entry/view/:id"
        element={<LedgerMappingView user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/bg-entry"
        element={<BgEntryList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/bg-entry/create"
        element={<BgEntryAddEdit user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/bg-entry/edit/:id"
        element={<BgEntryAddEdit user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/bg-entry/view/:id"
        element={<BgEntryView user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/zone-wise-collection"
        element={<ZoneCollectionList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/zone-wise-collection/create"
        element={<AddEditZoneCollection user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/zone-wise-collection/edit/:id"
        element={<AddEditZoneCollection user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/zone-wise-collection/zone/:zonId"
        element={<ZoneCollectionZoneView user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/fd-register"
        element={<FdRegisterList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/fd-register/create"
        element={<AddEditFdRegister user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/fd-register/edit/:id"
        element={<AddEditFdRegister user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/fd-register/view/:id"
        element={<ViewFdRegister user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/challan-voucher"
        element={<ChallanVoucherList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/challan-voucher/create"
        element={<AddEditChallanVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/challan-voucher/edit/:id"
        element={<AddEditChallanVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/challan-voucher/view/:id"
        element={<ViewChallanVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/contra-entries"
        element={<ContraVoucherList user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/contra-entries/create"
        element={<CreateContraVoucher user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/contra-entries/edit/:id"
        element={<ContraVoucherEdit user={user} />}
      />
      <Route
        path="bookkeeping-vouchers/contra-entries/view/:id"
        element={<ContraVoucherView user={user} />}
      />
      <Route
        path="budget-management/budgetapprovalsentry"
        element={<BudgetApprovalsList user={user} />}
      />
      <Route
        path="budget-management/budgetapprovalsentry/create"
        element={<EditBudgetApproveEntry user={user} />}
      />
      <Route
        path="budget-management/budgetapprovalsentry/edit/:id"
        element={<EditBudgetApproveEntry user={user} />}
      />
      <Route
        path="budget-management/budgetapprovalsentry/view/:id"
        element={<ViewBudgetApproveEntry user={user} />}
      />
      <Route
        path="budget-management/budgetfreeze"
        element={<BudgetFreezeList user={user} />}
      />
      <Route
        path="budget-management/budgetfreeze/create"
        element={<EditBudgetFreezeEntry user={user} />}
      />
      <Route
        path="budget-management/budgetfreeze/edit/:id"
        element={<EditBudgetFreezeEntry user={user} />}
      />
      <Route
        path="budget-management/budgetfreeze/view/:id"
        element={<ViewBudgetFreezeEntry user={user} />}
      />
      <Route
        path="budget-management/budgetinitialentry"
        element={<BudgetInitialEntryList user={user} />}
      />
      <Route
        path="budget-management/budgetinitialentry/create"
        element={<AddEditBudgetEntry user={user} />}
      />
      <Route
        path="budget-management/budgetinitialentry/edit/:id"
        element={<AddEditBudgetEntry user={user} />}
      />
      <Route
        path="budget-management/budgetinitialentry/view/:id"
        element={<ViewBudgetEntry user={user} />}
      />
      <Route
        path="budget-management/budgetjustificationuploads"
        element={<BudgetJustificationUploadsList user={user} />}
      />
      <Route
        path="budget-management/budgetjustificationuploads/create"
        element={<EditBudgetJustificationUploads user={user} />}
      />
      <Route
        path="budget-management/budgetjustificationuploads/edit/:id"
        element={<EditBudgetJustificationUploads user={user} />}
      />
      <Route
        path="budget-management/budgetjustificationuploads/view/:id"
        element={<ViewBudgetJustificationUploads user={user} />}
      />
      <Route
        path="budget-management/budgetrevisedentry"
        element={<BudgetRevisedList user={user} />}
      />
      <Route
        path="budget-management/budgetrevisedentry/create"
        element={<EditBudgetRevisedEntry user={user} />}
      />
      <Route
        path="budget-management/budgetrevisedentry/edit/:id"
        element={<EditBudgetRevisedEntry user={user} />}
      />
      <Route
        path="budget-management/budgetrevisedentry/view/:id"
        element={<ViewBudgetRevisedEntry user={user} />}
      />
      {/* grant-management */}
      <Route
        path="grant-management/grant-entry"
        element={<GrantEntryList user={user} />}
      />
      <Route
        path="grant-management/grant-entry/create"
        element={<AddEditGrantEntry user={user} />}
      />
      <Route
        path="grant-management/grant-entry/edit/:id"
        element={<AddEditGrantEntry user={user} />}
      />
      <Route
        path="grant-management/grant-entry/view/:id"
        element={<GrantEntryView user={user} />}
      />
      <Route
        path="grant-management/grant-entry-approval"
        element={<GrantEntryApprovalList user={user} />}
      />
      <Route
        path="grant-management/grant-entry-approval/view/:id"
        element={<GrantEntryApprovalView user={user} />}
      />
      {/* tender management */}
      <Route
        path="tender-management/emd-release"
        element={<TenderEntryList user={user} />}
      />
      <Route
        path="tender-management/emd-release/create"
        element={<AddEditTenderEntry user={user} />}
      />
      <Route
        path="tender-management/emd-release/edit/:id"
        element={<AddEditTenderEntry user={user} />}
      />
      <Route
        path="tender-management/emd-release/view/:id"
        element={<ViewTenderEntry user={user} />}
      />
      <Route
        path="tender-management/tenderentry"
        element={<TenderEntryList user={user} />}
      />
      <Route
        path="tender-management/tenderentry/create"
        element={<AddEditTenderEntry user={user} />}
      />
      <Route
        path="tender-management/tenderentry/edit/:id"
        element={<AddEditTenderEntry user={user} />}
      />
      <Route
        path="tender-management/tenderentry/view/:id"
        element={<ViewTenderEntry user={user} />}
      />
      <Route
        path="tender-management/tenderpenalty"
        element={<TenderPenaltyList user={user} />}
      />
      <Route
        path="tender-management/tenderpenalty/create"
        element={<AddEditTenderPenalty user={user} />}
      />
      <Route
        path="tender-management/tenderpenalty/edit/:id"
        element={<AddEditTenderPenalty user={user} />}
      />
      <Route
        path="tender-management/tenderpenalty/view/:id"
        element={<ViewTenderPenalty user={user} />}
      />
      <Route
        path="tender-management/workallocation"
        element={<WorkAllocationList user={user} />}
      />
      <Route
        path="tender-management/workallocation/create"
        element={<AddEditWorkAllocation user={user} />}
      />
      <Route
        path="tender-management/workallocation/edit/:id"
        element={<AddEditWorkAllocation user={user} />}
      />
      <Route
        path="tender-management/workallocation/view/:id"
        element={<ViewWorkAllocation user={user} />}
      />
      <Route
        path="tender-management/action-work-order"
        element={<ActionWorkList user={user} />}
      />
      <Route
        path="tender-management/action-work-order/create"
        element={<AddEditActionWork user={user} />}
      />
      <Route
        path="tender-management/action-work-order/edit/:id"
        element={<AddEditActionWork user={user} />}
      />
      <Route
        path="tender-management/action-work-order/view/:id"
        element={<ViewActionWork user={user} />}
      />
      <Route
        path="tender-management/work-order-penalty-hod-approval"
        element={<TenderPenaltyHodApprovalList user={user} />}
      />
      <Route
        path="tender-management/work-order-penalty-hod-approval/view/:id"
        element={<ViewTenderPenaltyHodApproval user={user} />}
      />
      <Route
        path="tender-management/tender-emd-bg-receipt-entry"
        element={<TenderEmdBgList user={user} />}
      />
      <Route
        path="tender-management/tender-emd-bg-receipt-entry/create"
        element={<AddEditTenderEmdBg user={user} />}
      />
      <Route
        path="tender-management/tender-emd-bg-receipt-entry/edit/:id"
        element={<AddEditTenderEmdBg user={user} />}
      />
      <Route
        path="tender-management/tender-emd-bg-receipt-entry/view/:id"
        element={<ViewTenderEmdBg user={user} />}
      />
      <Route
        path="tender-management/tender-emd-bg-hod-approval"
        element={<TenderEmdBgHodApprovalList user={user} />}
      />
      <Route
        path="tender-management/tender-emd-bg-hod-approval/view/:id"
        element={<ViewTenderEmdBgHodApproval user={user} />}
      />
      <Route
        path="tender-management/noc-entry"
        element={<NocEntryList user={user} />}
      />
      <Route
        path="tender-management/noc-entry/create"
        element={<AddEditNocEntry user={user} />}
      />
      <Route
        path="tender-management/noc-entry/edit/:id"
        element={<AddEditNocEntry user={user} />}
      />
      <Route
        path="tender-management/noc-entry/view/:id"
        element={<ViewNocEntry user={user} />}
      />
      <Route
        path="tender-management/noc-approval-entry"
        element={<NocEntryHodApprovalList user={user} />}
      />
      <Route
        path="tender-management/noc-approval-entry/view/:id"
        element={<ViewNocEntryHodApproval user={user} />}
      />
      <Route
        path="tender-management/work-bg-receipt-entry"
        element={<WorkBgList user={user} />}
      />
      <Route
        path="tender-management/work-bg-receipt-entry/create"
        element={<AddEditWorkBg user={user} />}
      />
      <Route
        path="tender-management/work-bg-receipt-entry/edit/:id"
        element={<AddEditWorkBg user={user} />}
      />
      <Route
        path="tender-management/work-bg-receipt-entry/view/:id"
        element={<ViewWorkBg user={user} />}
      />
      <Route
        path="tender-management/work-bg-approval-entry"
        element={<WorkBgHodApprovalList user={user} />}
      />
      <Route
        path="tender-management/work-bg-approval-entry/view/:id"
        element={<ViewWorkBgHodApproval user={user} />}
      />
      <Route
        path="tender-management/tender-emd-release"
        element={<AddEditTenderEmdRelease user={user} />}
      />
      <Route
        path="tender-management/tender-bg-release"
        element={<AddEditTenderBgRelease user={user} />}
      />
      {/* Vendor-Payments Route */}
      <Route
        path="vendor-payments/bill-challan-entry"
        element={<BillChallanEntryList user={user} />}
      />
      <Route
        path="vendor-payments/bill-challan-entry/create"
        element={<AddEditBillChallanEntry user={user} />}
      />
      <Route
        path="vendor-payments/bill-challan-entry/edit/:id"
        element={<AddEditBillChallanEntry user={user} />}
      />
      <Route
        path="vendor-payments/bill-challan-entry/view/:id"
        element={<ViewBillChallanEntry user={user} />}
      />
      <Route
        path="vendor-payments/hod-verification"
        element={<HodVerificationList user={user} />}
      />
      <Route
        path="vendor-payments/hod-verification/view/:id"
        element={<ViewHodVerification user={user} />}
      />
      <Route
        path="vendor-payments/account-verification"
        element={<AccountVerificationList user={user} />}
      />
      <Route
        path="vendor-payments/account-verification/view/:id"
        element={<ViewAccountVerification user={user} />}
      />
      <Route
        path="vendor-payments/payment-execution"
        element={<PaymentExecutionList user={user} />}
      />
      <Route
        path="vendor-payments/payment-execution/view/:id"
        element={<ViewPaymentExecution user={user} />}
      />
      {/* ************************** */}

      <Route path="service-events/special-duty"       element={<SpecialDuty user={user} />} />
      <Route path="service-events/award"              element={<Award user={user} />} />
      <Route path="service-events/significant-work"   element={<SignificantWork user={user} />} />
      <Route path="service-events/deputation"         element={<Deputation user={user} />} />
      <Route path="service-events/posting"            element={<Posting user={user} />} />
      <Route path="service-events/health-certificate" element={<HealthCertificate user={user} />} />
      <Route path="service-events/mass-allotment"     element={<MassAllotment user={user} />} />

      <Route path="donation/entry" element={<DonationEntry user={user} />} />
      <Route path="donation/approval" element={<DonationApproval user={user} />} />
      <Route path="donation/approval/view/:id" element={<DonationApprovalView user={user} />} />
      <Route path="donation/list" element={<DonationList user={user} />} />
      <Route path="donation/storage-allocation" element={<DonationStorageAllocation user={user} />} />

      <Route path="article-donation/entry" element={<ArticleDonationEntry user={user} />} />
      <Route path="article-donation/list" element={<ArticleDonationList user={user} />} />
      <Route path="article-donation/approval" element={<ArticleDonationApproval user={user} />} />
      <Route path="article-donation/approval/view/:id" element={<ArticleDonationApprovalView user={user} />} />
      <Route path="article-donation/report" element={<ArticleDonationReport user={user} />} />

    </Routes>
  );
};

export default TransactionsRoutes;

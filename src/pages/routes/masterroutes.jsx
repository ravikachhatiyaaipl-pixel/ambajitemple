/***
*
*  Application Name: I3EMS
*
*  Developed By: Aark InfoSoft Pvt Ltd.
*
*  Version: Ambaji Mata Temple Management
*  
*  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
*  All source code, database structures, UI/UX designs, workflows,
*  business logic, and documentation are confidential intellectual property.
*  Reverse engineering, duplication, or redistribution without written permission
*  is strictly prohibited and may result in legal action.
*  
*/

import { Routes, Route } from "react-router-dom";
import { lazy } from "react";
const DepartmentMaster = lazy(() => import("../masters/organization-management/department-master/departmentmaster"));
const ZoneList = lazy(() => import("../masters/organization-management/zone-master/list"));
const AddEditZone = lazy(() => import("../masters/organization-management/zone-master/addedit"));
const ViewZone = lazy(() => import("../masters/organization-management/zone-master/view"));
const WardList = lazy(() => import("../masters/organization-management/ward-master/list"));
const AddEditWard = lazy(() => import("../masters/organization-management/ward-master/addedit"));
const ViewWard = lazy(() => import("../masters/organization-management/ward-master/view"));
const AddEditArea = lazy(() => import("../masters/organization-management/area-master/addedit"));
const ViewArea = lazy(() => import("../masters/organization-management/area-master/view"));
const AreaList = lazy(() => import("../masters/organization-management/area-master/list"));
const AddEditCCC = lazy(() => import("../masters/organization-management/city-civic-centers-master/addedit"));
const ViewCCC = lazy(() => import("../masters/organization-management/city-civic-centers-master/view"));
const CCCList = lazy(() => import("../masters/organization-management/city-civic-centers-master/list"));
const AddEditTenderWorkType = lazy(() => import("../masters/tender-management/tenderworktype/addedit"));
const TenderWorkTypeList = lazy(() => import("../masters/tender-management/tenderworktype/list"));
const ViewTenderWorkType = lazy(() => import("../masters/tender-management/tenderworktype/view"));
const AddEditEMDBGType = lazy(() => import("../masters/tender-management/emdbgtype/addedit"));
const EMDBGTypeList = lazy(() => import("../masters/tender-management/emdbgtype/list"));
const ViewEMDBGType = lazy(() => import("../masters/tender-management/emdbgtype/view"));
const SchemeList = lazy(() => import("../masters/grant-management/scheme-master/list"));
const AddEditScheme = lazy(() => import("../masters/grant-management/scheme-master/addedit"));
const ViewScheme = lazy(() => import("../masters/grant-management/scheme-master/view"));
const DebtTypeList = lazy(() => import("../masters/grant-management/debt-type-master/list"));
const AddEditDebtType = lazy(() => import("../masters/grant-management/debt-type-master/addedit"));
const ViewDebtType = lazy(() => import("../masters/grant-management/debt-type-master/view"));
const GrantAuthoritiesList = lazy(() => import("../masters/grant-management/grantauthorities/list"));
const AddEditGrantAuthority = lazy(() => import("../masters/grant-management/grantauthorities/addedit"));
const ViewGrantAuthority = lazy(() => import("../masters/grant-management/grantauthorities/view"));
const GrantCategoryList = lazy(() => import("../masters/grant-management/grant-category/list"));
const AddEditGrantCategory = lazy(() => import("../masters/grant-management/grant-category/addedit"));
const ViewGrantCategory = lazy(() => import("../masters/grant-management/grant-category/view"));
const GrantTypeList = lazy(() => import("../masters/grant-management/grant-type-master/list"));
const AddEditGrantType = lazy(() => import("../masters/grant-management/grant-type-master/addedit"));
const ViewGrantType = lazy(() => import("../masters/grant-management/grant-type-master/view"));
const GrantDepartmentMappingList = lazy(() => import("../masters/grant-management/grant-department-mapping/list"));
const AddEditGrantDepartmentMapping = lazy(() => import("../masters/grant-management/grant-department-mapping/addedit"));
const ViewGrantDepartmentMapping = lazy(() => import("../masters/grant-management/grant-department-mapping/view"));
const SubledgerAccountList = lazy(() => import("../masters/financial-accounting/sub-ledger-accounts/list"));
const AddEditSubledgerAccount = lazy(() => import("../masters/financial-accounting/sub-ledger-accounts/addedit"));
const ViewSubledgerAccount = lazy(() => import("../masters/financial-accounting/sub-ledger-accounts/view"));
const PayStructureTypeList = lazy(() => import("../masters/payroll-pay-structures/pay-structure-type-master/list"));
const AddEditPayStructureType = lazy(() => import("../masters/payroll-pay-structures/pay-structure-type-master/addedit"));
const ViewPayStructureType = lazy(() => import("../masters/payroll-pay-structures/pay-structure-type-master/view"));
const PayCommissionList = lazy(() => import("../masters/payroll-pay-structures/pay-commission-master/list"));
const AddEditPayCommission = lazy(() => import("../masters/payroll-pay-structures/pay-commission-master/addedit"));
const ViewPayCommission = lazy(() => import("../masters/payroll-pay-structures/pay-commission-master/view"));
const PayScaleList = lazy(() => import("../masters/payroll-pay-structures/pay-scale-master/list"));
const AddEditPayScale = lazy(() => import("../masters/payroll-pay-structures/pay-scale-master/addedit"));
const ViewPayScale = lazy(() => import("../masters/payroll-pay-structures/pay-scale-master/view"));
const PayBandList = lazy(() => import("../masters/payroll-pay-structures/pay-band-master/list"));
const AddEditPayBand = lazy(() => import("../masters/payroll-pay-structures/pay-band-master/addedit"));
const ViewPayBand = lazy(() => import("../masters/payroll-pay-structures/pay-band-master/view"));
const GradeList = lazy(() => import("../masters/payroll-pay-structures/grade-pay-master/list"));
const AddEditGrade = lazy(() => import("../masters/payroll-pay-structures/grade-pay-master/addedit"));
const ViewGrade = lazy(() => import("../masters/payroll-pay-structures/grade-pay-master/view"));
const EmployeeStatusList = lazy(() => import("../masters/administrative-masters/employee-status-master/list"));
const AddEditEmployeeStatus = lazy(() => import("../masters/administrative-masters/employee-status-master/addedit"));
const ViewEmployeeStatus = lazy(() => import("../masters/administrative-masters/employee-status-master/view"));
const EmpTypeList = lazy(() => import("../masters/administrative-masters/employee-type-master/list"));
const AddEditEmpType = lazy(() => import("../masters/administrative-masters/employee-type-master/addedit"));
const ViewEmpType = lazy(() => import("../masters/administrative-masters/employee-type-master/view"));
const RelationshipList = lazy(() => import("../masters/employee-personal-masters/relationship-master/list"));
const AddEditRelationship = lazy(() => import("../masters/employee-personal-masters/relationship-master/addedit"));
const ViewRelationship = lazy(() => import("../masters/employee-personal-masters/relationship-master/view"));
const EmpQuotaList = lazy(() => import("../masters/administrative-masters/employee-quota-master/list"));
const AddEditEmpQuota = lazy(() => import("../masters/administrative-masters/employee-quota-master/addedit"));
const ViewEmpQuota = lazy(() => import("../masters/administrative-masters/employee-quota-master/view"));
const CasteList = lazy(() => import("../masters/administrative-masters/caste-master/list"));
const AddEditCaste = lazy(() => import("../masters/administrative-masters/caste-master/addedit"));
const ViewCaste = lazy(() => import("../masters/administrative-masters/caste-master/view"));
const EmpCategoryList = lazy(() => import("../masters/administrative-masters/employee-category-master/list"));
const AddEditEmpCategory = lazy(() => import("../masters/administrative-masters/employee-category-master/addedit"));
const ViewEmpCategory = lazy(() => import("../masters/administrative-masters/employee-category-master/view"));
const AddEditHoliday = lazy(() => import("../masters/leave-time-master/holidaymaster/addedit"));
const ListHoliday = lazy(() => import("../masters/leave-time-master/holidaymaster/list"));
const ViewHoliday = lazy(() => import("../masters/leave-time-master/holidaymaster/view"));
const AddEditHolidayDepMapping = lazy(() => import("../masters/leave-time-master/holiday-dep-mapping/addedit"));
const ListHolidayDepMapping = lazy(() => import("../masters/leave-time-master/holiday-dep-mapping/list"));
const ViewHolidayDepMapping = lazy(() => import("../masters/leave-time-master/holiday-dep-mapping/view"));
const AddEditHolidayDesgMapping = lazy(() => import("../masters/leave-time-master/holiday-desg-mapping/addedit"));
const ListHolidayDesgMapping = lazy(() => import("../masters/leave-time-master/holiday-desg-mapping/list"));
const ViewHolidayDesgMapping = lazy(() => import("../masters/leave-time-master/holiday-desg-mapping/view"));
const AddEditHolidayEmpMapping = lazy(() => import("../masters/leave-time-master/holiday-emp-map/addedit"));
const ListHolidayEmpMapping = lazy(() => import("../masters/leave-time-master/holiday-emp-map/list"));
const ViewHolidayEmpMapping = lazy(() => import("../masters/leave-time-master/holiday-emp-map/view"));
const AddEditHolidayShiftMapping = lazy(() => import("../masters/leave-time-master/holiday-shift-map/addedit"));
const ViewHolidayShiftMapping = lazy(() => import("../masters/leave-time-master/holiday-shift-map/view"));
const ListHolidayShiftMapping = lazy(() => import("../masters/leave-time-master/holiday-shift-map/list"));
const AddEditLeaveType = lazy(() => import("../masters/leave-time-master/leave-type/addedit"));
const ListLeaveType = lazy(() => import("../masters/leave-time-master/leave-type/list"));
const ViewLeaveType = lazy(() => import("../masters/leave-time-master/leave-type/view"));
const ViewShift = lazy(() => import("../masters/leave-time-master/shiftmaster/view"));
const AddEditShift = lazy(() => import("../masters/leave-time-master/shiftmaster/addedit"));
const ListShift = lazy(() => import("../masters/leave-time-master/shiftmaster/list"));
const EmpLanguageList = lazy(() => import("../masters/employee-records/employee-language-master/list"));
const AddEditEmpLanguage = lazy(() => import("../masters/employee-records/employee-language-master/addedit"));
const ViewEmpLanguage = lazy(() => import("../masters/employee-records/employee-language-master/view"));
const ViewEmployeeMaster = lazy(() => import("../masters/employee-records/employee-master/view"));
const AddEditEmployeeMaster = lazy(() => import("../masters/employee-records/employee-master/addedit"));
const EmployeeMasterList = lazy(() => import("../masters/employee-records/employee-master/list"));
const SigniWorkList = lazy(() => import("../masters/performance-discipline-masters/significant-work-master/list"));
const AddEditSigniWork = lazy(() => import("../masters/performance-discipline-masters/significant-work-master/addedit"));
const ViewSigniWork = lazy(() => import("../masters/performance-discipline-masters/significant-work-master/view"));
const IncExamList = lazy(() => import("../masters/performance-discipline-masters/increment-exam-master/list"));
const AddEditIncExam = lazy(() => import("../masters/performance-discipline-masters/increment-exam-master/addedit"));
const ViewIncExam = lazy(() => import("../masters/performance-discipline-masters/increment-exam-master/view"));
const EducationList = lazy(() => import("../masters/administrative-masters/education-qualification-master/list"));
const AddEditEducation = lazy(() => import("../masters/administrative-masters/education-qualification-master/addedit"));
const ViewEducation = lazy(() => import("../masters/administrative-masters/education-qualification-master/view"));
const BookAccountsList = lazy(() => import("../masters/financial-accounting/book-accounts/list"));
const AddEditBookAccounts = lazy(() => import("../masters/financial-accounting/book-accounts/addedit"));
const ViewBookAccounts = lazy(() => import("../masters/financial-accounting/book-accounts/view"));
const AddEditLedger = lazy(() => import("../masters/financial-accounting/ledger-accounting/addedit"));
const LedgerList = lazy(() => import("../masters/financial-accounting/ledger-accounting/list"));
const ViewLedger = lazy(() => import("../masters/financial-accounting/ledger-accounting/view"));
const LedgerGrouping = lazy(() => import("../masters/financial-accounting/ledger-grouping/ledger-grouping"));
const BudgetHeadManagement = lazy(() => import("../masters/financial-accounting/budget-head-management/budgetheadmanagement"));
const VendorInvoiceTaxesList = lazy(() => import("../masters/financial-accounting/vendor-invoice-taxes/list"));
const AddEditVendorInvoiceTaxes = lazy(() => import("../masters/financial-accounting/vendor-invoice-taxes/addedit"));
const ViewVendorInvoiceTaxes = lazy(() => import("../masters/financial-accounting/vendor-invoice-taxes/view"));
const PayAlwdedList = lazy(() => import("../masters/payroll-pay-structures/allowances-deductions-master/list"));
const AddEditPayAlwded = lazy(() => import("../masters/payroll-pay-structures/allowances-deductions-master/addedit"));
const ViewPayAlwded = lazy(() => import("../masters/payroll-pay-structures/allowances-deductions-master/view"));
const PayLevelList = lazy(() => import("../masters/payroll-pay-structures/pay-level/list"));
const AddEditPayLevel = lazy(() => import("../masters/payroll-pay-structures/pay-level/addedit"));
const ViewPayLevel = lazy(() => import("../masters/payroll-pay-structures/pay-level/view"));
const PayMatrixList = lazy(() => import("../masters/payroll-pay-structures/pay-matrix/list"));
const AddEditPayMatrix = lazy(() => import("../masters/payroll-pay-structures/pay-matrix/addedit"));
const ViewPayMatrix = lazy(() => import("../masters/payroll-pay-structures/pay-matrix/view"));
const DesignationMaster = lazy(() => import("../masters/administrative-masters/designation-master/designation-master"));
const AddEditInvoiceTaxParameter = lazy(() => import("../masters/financial-accounting/invoice-tax-parameters/addedit"));
const InvoiceTaxParameterList = lazy(() => import("../masters/financial-accounting/invoice-tax-parameters/list"));
const ViewInvoiceTaxParameter = lazy(() => import("../masters/financial-accounting/invoice-tax-parameters/view"));
const AddEditEmpFamilyInfo = lazy(() => import("../masters/employee-personal-masters/emp-family-info/addedit"));
const ListEmpFamilyInfo = lazy(() => import("../masters/employee-personal-masters/emp-family-info/list"));
const ViewEmpFamilyInfo = lazy(() => import("../masters/employee-personal-masters/emp-family-info/view"));
const AddEditEmployeeEducationProfile = lazy(() => import("../masters/employee-records/employee-qualification-details/addedit"));
const EmployeeEducationProfileList = lazy(() => import("../masters/employee-records/employee-qualification-details/list"));
const ViewEmployeeEducationProfile = lazy(() => import("../masters/employee-records/employee-qualification-details/view"));
const ListEmpProfileUpdate = lazy(() => import("../masters/employee-records/emp-profile-update/list"));
const ViewEmpProfileUpdate = lazy(() => import("../masters/employee-records/emp-profile-update/view"));
const AddEditDaRate = lazy(() => import("../masters/payroll-pay-structures/da-hra-ta-rate-master/addedit"));
const ListDaRate = lazy(() => import("../masters/payroll-pay-structures/da-hra-ta-rate-master/list"));
const ViewDaRate = lazy(() => import("../masters/payroll-pay-structures/da-hra-ta-rate-master/view"));
const ListDesgPayMapping = lazy(() => import("../masters/payroll-pay-structures/desg-pay-mapping/list"));
const AddEditDesgPayMapping = lazy(() => import("../masters/payroll-pay-structures/desg-pay-mapping/addedit"));
const ViewDesgPayMapping = lazy(() => import("../masters/payroll-pay-structures/desg-pay-mapping/view"));
const AddEditTaxSlab = lazy(() => import("../masters/administrative-masters/tax-slab/addedit"));
const ViewTaxSlab = lazy(() => import("../masters/administrative-masters/tax-slab/view"));
const TaxSlabList = lazy(() => import("../masters/administrative-masters/tax-slab/list"));
const ListCityHra = lazy(() => import("../masters/administrative-masters/city-hra-cla/list"));
const ViewCityHra = lazy(() => import("../masters/administrative-masters/city-hra-cla/view"));
const AddEditCityHra = lazy(() => import("../masters/administrative-masters/city-hra-cla/addedit"));
const HouseTypeList = lazy(() => import("../masters/administrative-masters/house-type-master/list"));
const AddEditHouseType = lazy(() => import("../masters/administrative-masters/house-type-master/addedit"));
const ViewHouseType = lazy(() => import("../masters/administrative-masters/house-type-master/view"));
const CityGradeList = lazy(() => import("../masters/administrative-masters/city-grade-master/list"));
const AddEditCityGrade = lazy(() => import("../masters/administrative-masters/city-grade-master/addedit"));
const ViewCityGrade = lazy(() => import("../masters/administrative-masters/city-grade-master/view"));
const SpecialDutyList = lazy(() => import("../masters/performance-discipline-masters/special-duty-master/list"));
const AddEditSpecialDuty = lazy(() => import("../masters/performance-discipline-masters/special-duty-master/addedit"));
const ViewSpecialDuty = lazy(() => import("../masters/performance-discipline-masters/special-duty-master/view"));
const AwardList = lazy(() => import("../masters/performance-discipline-masters/award-appreciation-master/list"));
const AddEditAward = lazy(() => import("../masters/performance-discipline-masters/award-appreciation-master/addedit"));
const ViewAward = lazy(() => import("../masters/performance-discipline-masters/award-appreciation-master/view"));
const PayrollBillList = lazy(() => import("../masters/administrative-masters/paybill-master/list"));
const AddEditPayrollBill = lazy(() => import("../masters/administrative-masters/paybill-master/addedit"));
const ViewPayrollBill = lazy(() => import("../masters/administrative-masters/paybill-master/view"));
const ListDesPostBook = lazy(() => import("../masters/administrative-masters/des-post-book/list"));
const AddEditDesPostBook = lazy(() => import("../masters/administrative-masters/des-post-book/addedit"));
const ViewDesPostBook = lazy(() => import("../masters/administrative-masters/des-post-book/view"));
const AddEmpProfileUpdate = lazy(() => import("../masters/employee-records/emp-profile-update/add"));
const EditEmpProfileUpdate = lazy(() => import("../masters/employee-records/emp-profile-update/edit"));
const HistoryEmpProfileUpdate = lazy(() => import("../masters/employee-records/emp-profile-update/history"));
const ChallanTypeList = lazy(() => import("../masters/tender-management/challan-type/list"));
const AddEditChallanType = lazy(() => import("../masters/tender-management/challan-type/addedit"));
const ViewChallanType = lazy(() => import("../masters/tender-management/challan-type/view"));
const VerdorRegisterList = lazy(() => import("../masters/financial-accounting/vendor-register/list"));
const AddEditVerdorRegister = lazy(() => import("../masters/financial-accounting/vendor-register/addedit"));
const ViewVerdorRegister = lazy(() => import("../masters/financial-accounting/vendor-register/view"));
const TamarateList = lazy(() => import("../masters/payroll-pay-structures/ta-ma-rate-master/list"));
const AddEditTamarate = lazy(() => import("../masters/payroll-pay-structures/ta-ma-rate-master/addedit"));
const ViewTamarate = lazy(() => import("../masters/payroll-pay-structures/ta-ma-rate-master/view"));
const EmpGroupInsuranceList = lazy(() => import("../masters/employee-records/emp-group-insurance/list"));
const AddEditEmpGroupInsurance = lazy(() => import("../masters/employee-records/emp-group-insurance/addedit"));
const ViewEmpGroupInsurance = lazy(() => import("../masters/employee-records/emp-group-insurance/view"));
const AddEditWoffPattern = lazy(() => import("../masters/leave-time-master/woff-master/addedit"));
const ListWoffPattern = lazy(() => import("../masters/leave-time-master/woff-master/list"));
const ViewWoffPattern = lazy(() => import("../masters/leave-time-master/woff-master/view"));
const LoanTypeList = lazy(() => import("../masters/loan-management/loan-type-master/list"));
const AddEditLoanType = lazy(() => import("../masters/loan-management/loan-type-master/addedit"));
const ViewLoanType = lazy(() => import("../masters/loan-management/loan-type-master/view"));
const ListLoanDocument = lazy(() => import("../masters/loan-management/loan-doc-master/list"));
const AddEditLoanDocument = lazy(() => import("../masters/loan-management/loan-doc-master/addedit"));
const ViewLoanDocument = lazy(() => import("../masters/loan-management/loan-doc-master/view"));
const ChallanTaxParameterList = lazy(() => import("../masters/financial-accounting/challan-tax-parameters/list"));
const AddEditChallanTaxParameter = lazy(() => import("../masters/financial-accounting/challan-tax-parameters/addedit"));
const ViewChallanTaxParameter = lazy(() => import("../masters/financial-accounting/challan-tax-parameters/view"));
const VendorTDSConfigurationList = lazy(() => import("../masters/financial-accounting/vendortdsconfiguration-master/list"));
const AddEditVendorTDSConfiguration = lazy(() => import("../masters/financial-accounting/vendortdsconfiguration-master/addedit"));
const ViewVendorTDSConfiguration = lazy(() => import("../masters/financial-accounting/vendortdsconfiguration-master/view"));
const VendorBkCheckList = lazy(() => import("../masters/financial-accounting/vendor-check-register/list"));
const AddEditGraDeptMap = lazy(() => import("../masters/grant-management/gra-dept-map/addedit"));
const GraDeptMapList = lazy(() => import("../masters/grant-management/gra-dept-map/list"));
const ViewGraDeptMap = lazy(() => import("../masters/grant-management/gra-dept-map/view"));
const AddEditVendorBkCheck = lazy(() => import("../masters/financial-accounting/vendor-check-register/addedit"));
const ViewVendorBkCheck = lazy(() => import("../masters/financial-accounting/vendor-check-register/view"));
const BankAuthList = lazy(() => import("../masters/financial-accounting/bank-account-authentication/bankauth"));
const ViewBankAuth = lazy(() => import("../masters/financial-accounting/bank-account-authentication/view"));
const BanksList = lazy(() => import("../masters/financial-accounting/banks/list"));
const AddEditbanks = lazy(() => import("../masters/financial-accounting/banks/addedit"));
const Viewbanks = lazy(() => import("../masters/financial-accounting/banks/view"));
const BankAccountsList = lazy(() => import("../masters/financial-accounting/bank-accounts/list"));
const AddEditBankAccounts = lazy(() => import("../masters/financial-accounting/bank-accounts/addedit"));
const ViewBankAccounts = lazy(() => import("../masters/financial-accounting/bank-accounts/view"));
const AddEditChequeBooks = lazy(() => import("../masters/financial-accounting/cheque-books/addedit"));
const ChequeBooksList = lazy(() => import("../masters/financial-accounting/cheque-books/list"));
const ViewChequeBooks = lazy(() => import("../masters/financial-accounting/cheque-books/view"));
const ChequeFormatsList = lazy(() => import("../masters/financial-accounting/cheque-formats/list"));
const AddEditChequeFormats = lazy(() => import("../masters/financial-accounting/cheque-formats/addedit"));
const ViewChequeFormats = lazy(() => import("../masters/financial-accounting/cheque-formats/view"));
const ChequesList = lazy(() => import("../masters/financial-accounting/cheques/list"));
const AddEditCheques = lazy(() => import("../masters/financial-accounting/cheques/addedit"));
const ViewCheques = lazy(() => import("../masters/financial-accounting/cheques/view"));
const PrintQueuesList = lazy(() => import("../masters/financial-accounting/print-queues/list"));
const AddEditPrintQueues = lazy(() => import("../masters/financial-accounting/print-queues/addedit"));
const ViewPrintQueues = lazy(() => import("../masters/financial-accounting/print-queues/view"));
const ShopCategoryList = lazy(() => import("../masters/hall-shop-management/shop-categories/list"));
const AddEditShopCategory = lazy(() => import("../masters/hall-shop-management/shop-categories/addedit"));
const ViewShopCategory = lazy(() => import("../masters/hall-shop-management/shop-categories/view"));
const ShopList = lazy(() => import("../masters/hall-shop-management/shop-master/list"));
const AddEditShop = lazy(() => import("../masters/hall-shop-management/shop-master/addedit"));
const ViewShop = lazy(() => import("../masters/hall-shop-management/shop-master/view"));
const ShopRentalList = lazy(() => import("../masters/hall-shop-management/shop-rental/list"));
const AddEditShopRental = lazy(() => import("../masters/hall-shop-management/shop-rental/addedit"));
const ViewShopRental = lazy(() => import("../masters/hall-shop-management/shop-rental/view"));
const ShopRentApplicationList = lazy(() => import("../masters/hall-shop-management/shop-rent-application/list"));
const AddEditShopRentApplication = lazy(() => import("../masters/hall-shop-management/shop-rent-application/addedit"));
const ViewShopRentApplication = lazy(() => import("../masters/hall-shop-management/shop-rent-application/view"));
const ShopRentApplicationApprovalList = lazy(() => import("../masters/hall-shop-management/shop-rent-application-approval/list"));
const ShopRentApplicationApprovalView = lazy(() => import("../masters/hall-shop-management/shop-rent-application-approval/view"));
const ShopRentAgreementList = lazy(() => import("../masters/hall-shop-management/shop-rent-agreement/list"));
const AddEditShopRentAgreement = lazy(() => import("../masters/hall-shop-management/shop-rent-agreement/addedit"));
const SevaServices = lazy(() => import("../masters/hall-shop-management/seva-services/addedit"));
const SevaServiceKinds = lazy(() => import("../masters/hall-shop-management/seva-services/kinds"));
const SevaPackages = lazy(() => import("../masters/hall-shop-management/seva-services/packages"));
const SevaDocumentMaster = lazy(() => import("../masters/hall-shop-management/seva-services/document-master"));
const SevaDocumentMapping = lazy(() => import("../masters/hall-shop-management/seva-services/document-mapping"));
const SevaCategoryMaster = lazy(() => import("../masters/hall-shop-management/seva-services/categories"));
const SevaBookings = lazy(() => import("../masters/hall-shop-management/seva-services/bookings"));
const SevaApprovals = lazy(() => import("../masters/hall-shop-management/seva-services/approvals"));
const SevaActionMaster = lazy(() => import("../masters/hall-shop-management/seva-services/action-master"));
const SevaPriests = lazy(() => import("../masters/hall-shop-management/seva-services/priests"));
const SevaOrganizers = lazy(() => import("../masters/hall-shop-management/seva-services/organizers"));
const ShopRentTransactionList = lazy(() => import("../masters/hall-shop-management/shop-rent-transaction/list"));
const AddEditShopRentTransaction = lazy(() => import("../masters/hall-shop-management/shop-rent-transaction/addedit"));
const ViewShopRentTransaction = lazy(() => import("../masters/hall-shop-management/shop-rent-transaction/view"));
const HallCategoryList = lazy(() => import("../masters/hall-shop-management/hall-category/list"));
const AddEditHallCategory = lazy(() => import("../masters/hall-shop-management/hall-category/addedit"));
const ViewHallCategory = lazy(() => import("../masters/hall-shop-management/hall-category/view"));
const HallList = lazy(() => import("../masters/hall-shop-management/hall-master/list"));
const AddEditHall = lazy(() => import("../masters/hall-shop-management/hall-master/addedit"));
const ViewHall = lazy(() => import("../masters/hall-shop-management/hall-master/view"));
const HallRentalList = lazy(() => import("../masters/hall-shop-management/hall-rental/list"));
const AddEditHallRental = lazy(() => import("../masters/hall-shop-management/hall-rental/addedit"));
const ViewHallRental = lazy(() => import("../masters/hall-shop-management/hall-rental/view"));
const HallAddonList = lazy(() => import("../masters/hall-shop-management/hall-addon/list"));
const AddEditHallAddon = lazy(() => import("../masters/hall-shop-management/hall-addon/addedit"));
const ViewHallAddon = lazy(() => import("../masters/hall-shop-management/hall-addon/view"));
const HallRentApplicationList = lazy(() => import("../masters/hall-shop-management/hall-rent-application/list"));
const AddEditHallRentApplication = lazy(() => import("../masters/hall-shop-management/hall-rent-application/addedit"));
const ViewHallRentApplication = lazy(() => import("../masters/hall-shop-management/hall-rent-application/view"));
const HallRentApplicationApprovalList = lazy(() => import("../masters/hall-shop-management/hall-rent-application-approval/list"));
const HallRentApplicationApprovalView = lazy(() => import("../masters/hall-shop-management/hall-rent-application-approval/view"));
const HallRentBookingList = lazy(() => import("../masters/hall-shop-management/hall-rent-booking/list"));
const AddEditHallRentBooking = lazy(() => import("../masters/hall-shop-management/hall-rent-booking/addedit"));
const ViewHallRentBooking = lazy(() => import("../masters/hall-shop-management/hall-rent-booking/view"));
const HallRentBookingApprovalList = lazy(() => import("../masters/hall-shop-management/hall-rent-booking-approval/list"));
const HallRentBookingApprovalView = lazy(() => import("../masters/hall-shop-management/hall-rent-booking-approval/view"));
const HallRentalBookingAddonList = lazy(() => import("../masters/hall-shop-management/hall-rental-booking-addon/list"));
const AddEditHallRentalBookingAddon = lazy(() => import("../masters/hall-shop-management/hall-rental-booking-addon/addedit"));
const ViewHallRentalBookingAddon = lazy(() => import("../masters/hall-shop-management/hall-rental-booking-addon/view"));
const HallRentBookingTransactionList = lazy(() => import("../masters/hall-shop-management/hall-rent-booking-transaction/list"));
const AddEditHallRentBookingTransaction = lazy(() => import("../masters/hall-shop-management/hall-rent-booking-transaction/addedit"));
const ViewHallRentBookingTransaction = lazy(() => import("../masters/hall-shop-management/hall-rent-booking-transaction/view"));
const HallRentBookingTransactionApprovalList = lazy(() => import("../masters/hall-shop-management/hall-rent-booking-transaction-approval/list"));
const HallRentBookingTransactionApprovalView = lazy(() => import("../masters/hall-shop-management/hall-rent-booking-transaction-approval/view"));
const RelationMaster = lazy(() => import("../masters/family-noc/relation"));
const FamilyMembers = lazy(() => import("../masters/family-noc/member"));
const NocAgeRule = lazy(() => import("../masters/family-noc/age-rule"));
const FamilyNoc = lazy(() => import("../masters/family-noc/noc"));
const StatutoryHeads = lazy(() => import("../masters/statutory/heads"));
const InquiryTypeMaster = lazy(() => import("../masters/hr-config/inquiry-type"));
const TransferCriteria = lazy(() => import("../masters/hr-config/transfer-criteria"));
const PromotionCriteria = lazy(() => import("../masters/hr-config/promotion-criteria"));

const MasterRoutes = ({ user }) => {
  return (
    <Routes>

      {/* /* family noc masters route */}
      <Route path="family-noc/relation" element={<RelationMaster user={user} />} />
      <Route path="family-noc/member"   element={<FamilyMembers user={user} />} />
      <Route path="family-noc/age-rule" element={<NocAgeRule user={user} />} />
      <Route path="family-noc/noc"      element={<FamilyNoc user={user} />} />
      <Route path="statutory/heads"     element={<StatutoryHeads user={user} />} />

      {/* hr master route */}
      <Route path="hr-config/inquiry-type"       element={<InquiryTypeMaster user={user} />} />
      <Route path="hr-config/transfer-criteria"  element={<TransferCriteria user={user} />} />
      <Route path="hr-config/promotion-criteria" element={<PromotionCriteria user={user} />} />

      {/* Loan-management route */}
      <Route
        path="loan-management/loan-type-master"
        element={<LoanTypeList peList user={user} />}
      />
      <Route
        path="loan-management/loan-type-master/create"
        element={<AddEditLoanType user={user} />}
      />
      <Route
        path="loan-management/loan-type-master/edit/:id"
        element={<AddEditLoanType user={user} />}
      />
      <Route
        path="loan-management/loan-type-master/view/:id"
        element={<ViewLoanType user={user} />}
      />
      <Route
        path="loan-management/loan-doc-master"
        element={<ListLoanDocument peList user={user} />}
      />
      <Route
        path="loan-management/loan-doc-master/create"
        element={<AddEditLoanDocument user={user} />}
      />
      <Route
        path="loan-management/loan-doc-master/edit/:id"
        element={<AddEditLoanDocument user={user} />}
      />
      <Route
        path="loan-management/loan-doc-master/view/:id"
        element={<ViewLoanDocument user={user} />}
      />

      {/* organization-management route */}
      <Route
        path="organization-management/department-master"
        element={<DepartmentMaster user={user} />}
      />
      <Route
        path="organization-management/zone-master"
        element={<ZoneList user={user} />}
      />
      <Route
        path="organization-management/zone-master/create"
        element={<AddEditZone user={user} />}
      />
      <Route
        path="organization-management/zone-master/edit/:id"
        element={<AddEditZone user={user} />}
      />
      <Route
        path="organization-management/zone-master/view/:id"
        element={<ViewZone user={user} />}
      />

      <Route
        path="organization-management/ward-master"
        element={<WardList user={user} />}
      />
      <Route
        path="organization-management/ward-master/create"
        element={<AddEditWard user={user} />}
      />
      <Route
        path="organization-management/ward-master/edit/:id"
        element={<AddEditWard user={user} />}
      />
      <Route
        path="organization-management/ward-master/view/:id"
        element={<ViewWard user={user} />}
      />

      <Route
        path="organization-management/area-master"
        element={<AreaList user={user} />}
      />
      <Route
        path="organization-management/area-master/create"
        element={<AddEditArea user={user} />}
      />
      <Route
        path="organization-management/area-master/edit/:id"
        element={<AddEditArea user={user} />}
      />
      <Route
        path="organization-management/area-master/view/:id"
        element={<ViewArea user={user} />}
      />

      <Route
        path="organization-management/city-civic-centers-master"
        element={<CCCList user={user} />}
      />
      <Route
        path="organization-management/city-civic-centers-master/create"
        element={<AddEditCCC user={user} />}
      />
      <Route
        path="organization-management/city-civic-centers-master/edit/:id"
        element={<AddEditCCC user={user} />}
      />
      <Route
        path="organization-management/city-civic-centers-master/view/:id"
        element={<ViewCCC user={user} />}
      />
      {/* //////////////////////////////////////////////// */}

      {/* tender-management route */}

      <Route
        path="tender-management/challan-type"
        element={<ChallanTypeList user={user} />}
      />
      <Route
        path="tender-management/challan-type/create"
        element={<AddEditChallanType user={user} />}
      />
      <Route
        path="tender-management/challan-type/edit/:id"
        element={<AddEditChallanType user={user} />}
      />
      <Route
        path="tender-management/challan-type/view/:id"
        element={<ViewChallanType user={user} />}
      />

      <Route
        path="tender-management/tender-work-type"
        element={<TenderWorkTypeList user={user} />}
      />
      <Route
        path="tender-management/tender-work-type/create"
        element={<AddEditTenderWorkType user={user} />}
      />
      <Route
        path="tender-management/tender-work-type/edit/:id"
        element={<AddEditTenderWorkType user={user} />}
      />
      <Route
        path="tender-management/tender-work-type/view/:id"
        element={<ViewTenderWorkType user={user} />}
      />
      <Route
        path="tender-management/emdbg-type"
        element={<EMDBGTypeList user={user} />}
      />
      <Route
        path="tender-management/emdbg-type/create"
        element={<AddEditEMDBGType user={user} />}
      />
      <Route
        path="tender-management/emdbg-type/edit/:id"
        element={<AddEditEMDBGType user={user} />}
      />
      <Route
        path="tender-management/emdbg-type/view/:id"
        element={<ViewEMDBGType user={user} />}
      />

      {/* //////////////////////////////////////////////// */}

      {/* Leave & Time Master */}

      <Route
        path="leave-time-master/woff-master/create"
        element={<AddEditWoffPattern user={user} />}
      />
      <Route
        path="leave-time-master/woff-master"
        element={<ListWoffPattern user={user} />}
      />
      <Route
        path="leave-time-master/woff-master/edit/:id"
        element={<AddEditWoffPattern user={user} />}
      />
      <Route
        path="leave-time-master/woff-master/view/:id"
        element={<ViewWoffPattern user={user} />}
      />
      <Route
        path="leave-time-master/holidaymaster/create"
        element={<AddEditHoliday user={user} />}
      />
      <Route
        path="leave-time-master/holidaymaster"
        element={<ListHoliday user={user} />}
      />
      <Route
        path="leave-time-master/holidaymaster/edit/:id"
        element={<AddEditHoliday user={user} />}
      />
      <Route
        path="leave-time-master/holidaymaster/view/:id"
        element={<ViewHoliday user={user} />}
      />
      <Route
        path="leave-time-master/holiday-dep-mapping/create"
        element={<AddEditHolidayDepMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-dep-mapping"
        element={<ListHolidayDepMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-dep-mapping/edit/:id"
        element={<AddEditHolidayDepMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-dep-mapping/view/:id"
        element={<ViewHolidayDepMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-desg-mapping/create"
        element={<AddEditHolidayDesgMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-desg-mapping/edit/:id"
        element={<AddEditHolidayDesgMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-desg-mapping"
        element={<ListHolidayDesgMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-desg-mapping/view/:id"
        element={<ViewHolidayDesgMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-emp-map/create"
        element={<AddEditHolidayEmpMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-emp-map/edit/:id"
        element={<AddEditHolidayEmpMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-emp-map"
        element={<ListHolidayEmpMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-emp-map/view/:id"
        element={<ViewHolidayEmpMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-shift-map/create"
        element={<AddEditHolidayShiftMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-shift-map/edit/:id"
        element={<AddEditHolidayShiftMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-shift-map/view/:id"
        element={<ViewHolidayShiftMapping user={user} />}
      />
      <Route
        path="leave-time-master/holiday-shift-map"
        element={<ListHolidayShiftMapping user={user} />}
      />
      <Route
        path="leave-time-master/leave-type/create"
        element={<AddEditLeaveType user={user} />}
      />
      <Route
        path="leave-time-master/leave-type/edit/:id"
        element={<AddEditLeaveType user={user} />}
      />
      <Route
        path="leave-time-master/leave-type"
        element={<ListLeaveType user={user} />}
      />
      <Route
        path="leave-time-master/leave-type/view/:id"
        element={<ViewLeaveType user={user} />}
      />
      <Route
        path="leave-time-master/shiftmaster/view/:id"
        element={<ViewShift user={user} />}
      />
      <Route
        path="leave-time-master/shiftmaster/edit/:id"
        element={<AddEditShift user={user} />}
      />
      <Route
        path="leave-time-master/shiftmaster/create"
        element={<AddEditShift user={user} />}
      />
      <Route
        path="leave-time-master/shiftmaster"
        element={<ListShift user={user} />}
      />

      {/* grant-management route */}
      <Route
        path="grant-management/scheme-master"
        element={<SchemeList user={user} />}
      />
      <Route
        path="grant-management/scheme-master/create"
        element={<AddEditScheme user={user} />}
      />
      <Route
        path="grant-management/scheme-master/edit/:id"
        element={<AddEditScheme user={user} />}
      />
      <Route
        path="grant-management/scheme-master/view/:id"
        element={<ViewScheme user={user} />}
      />
      <Route
        path="grant-management/debt-type-master"
        element={<DebtTypeList user={user} />}
      />
      <Route
        path="grant-management/debt-type-master/create"
        element={<AddEditDebtType user={user} />}
      />
      <Route
        path="grant-management/debt-type-master/edit/:id"
        element={<AddEditDebtType user={user} />}
      />
      <Route
        path="grant-management/debt-type-master/view/:id"
        element={<ViewDebtType user={user} />}
      />
      <Route
        path="grant-management/grant-authorities-master"
        element={<GrantAuthoritiesList user={user} />}
      />
      <Route
        path="grant-management/grant-authorities-master/create"
        element={<AddEditGrantAuthority user={user} />}
      />
      <Route
        path="grant-management/grant-authorities-master/edit/:id"
        element={<AddEditGrantAuthority user={user} />}
      />
      <Route
        path="grant-management/grant-authorities-master/view/:id"
        element={<ViewGrantAuthority user={user} />}
      />

      <Route
        path="grant-management/grant-category-master"
        element={<GrantCategoryList user={user} />}
      />
      <Route
        path="grant-management/grant-category-master/create"
        element={<AddEditGrantCategory user={user} />}
      />
      <Route
        path="grant-management/grant-category-master/edit/:id"
        element={<AddEditGrantCategory user={user} />}
      />
      <Route
        path="grant-management/grant-category-master/view/:id"
        element={<ViewGrantCategory user={user} />}
      />

      <Route
        path="grant-management/grant-type-master"
        element={<GrantTypeList user={user} />}
      />
      <Route
        path="grant-management/grant-type-master/create"
        element={<AddEditGrantType user={user} />}
      />
      <Route
        path="grant-management/grant-type-master/edit/:id"
        element={<AddEditGrantType user={user} />}
      />
      <Route
        path="grant-management/grant-type-master/view/:id"
        element={<ViewGrantType user={user} />}
      />
      <Route
        path="grant-management/grant-department-mapping"
        element={<GrantDepartmentMappingList user={user} />}
      />
      <Route
        path="grant-management/grant-department-mapping/create"
        element={<AddEditGrantDepartmentMapping user={user} />}
      />
      <Route
        path="grant-management/grant-department-mapping/edit/:id"
        element={<AddEditGrantDepartmentMapping user={user} />}
      />
      <Route
        path="grant-management/grant-department-mapping/view/:id"
        element={<ViewGrantDepartmentMapping user={user} />}
      />
      <Route
        path="grant-management/gra-dept-map"
        element={<GraDeptMapList user={user} />}
      />
      <Route
        path="grant-management/gra-dept-map/create"
        element={<AddEditGraDeptMap user={user} />}
      />
      <Route
        path="grant-management/gra-dept-map/edit/:id"
        element={<AddEditGraDeptMap user={user} />}
      />
      <Route
        path="grant-management/gra-dept-map/view/:id"
        element={<ViewGraDeptMap user={user} />}
      />
      {/* //////////////////////////////////////////////// */}

      {/* administrative-masters Route */}

      <Route
        path="administrative-masters/des-post-book"
        element={<ListDesPostBook user={user} />}
      />
      <Route
        path="administrative-masters/des-post-book/create"
        element={<AddEditDesPostBook user={user} />}
      />
      <Route
        path="administrative-masters/des-post-book/edit/:id"
        element={<AddEditDesPostBook user={user} />}
      />
      <Route
        path="administrative-masters/des-post-book/view/:id"
        element={<ViewDesPostBook user={user} />}
      /> 

      <Route
        path="administrative-masters/paybill-master"
        element={<PayrollBillList user={user} />}
      />
      <Route
        path="administrative-masters/paybill-master/create"
        element={<AddEditPayrollBill user={user} />}
      />
      <Route
        path="administrative-masters/paybill-master/edit/:id"
        element={<AddEditPayrollBill user={user} />}
      />
      <Route
        path="administrative-masters/paybill-master/view/:id"
        element={<ViewPayrollBill user={user} />}
      /> 

      <Route
        path="administrative-masters/city-grade"
        element={<CityGradeList user={user} />}
      />
      <Route
        path="administrative-masters/city-grade/create"
        element={<AddEditCityGrade user={user} />}
      />
      <Route
        path="administrative-masters/city-grade/edit/:id"
        element={<AddEditCityGrade user={user} />}
      />
      <Route
        path="administrative-masters/city-grade/view/:id"
        element={<ViewCityGrade user={user} />}
      />      
      <Route
        path="administrative-masters/house-type"
        element={<HouseTypeList user={user} />}
      />
      <Route
        path="administrative-masters/house-type/create"
        element={<AddEditHouseType user={user} />}
      />
      <Route
        path="administrative-masters/house-type/edit/:id"
        element={<AddEditHouseType user={user} />}
      />
      <Route
        path="administrative-masters/house-type/view/:id"
        element={<ViewHouseType user={user} />}
      />      
      <Route
        path="administrative-masters/education-qualification-master"
        element={<EducationList user={user} />}
      />
      <Route
        path="administrative-masters/education-qualification-master/create"
        element={<AddEditEducation user={user} />}
      />
      <Route
        path="administrative-masters/education-qualification-master/edit/:id"
        element={<AddEditEducation user={user} />}
      />
      <Route
        path="administrative-masters/education-qualification-master/view/:id"
        element={<ViewEducation user={user} />}
      />
      <Route
        path="administrative-masters/caste-master"
        element={<CasteList user={user} />}
      />
      <Route
        path="administrative-masters/caste-master/create"
        element={<AddEditCaste user={user} />}
      />
      <Route
        path="administrative-masters/caste-master/edit/:id"
        element={<AddEditCaste user={user} />}
      />
      <Route
        path="administrative-masters/caste-master/view/:id"
        element={<ViewCaste user={user} />}
      />
      <Route
        path="administrative-masters/employee-status-master"
        element={<EmployeeStatusList user={user} />}
      />
      <Route
        path="administrative-masters/employee-status-master/create"
        element={<AddEditEmployeeStatus user={user} />}
      />
      <Route
        path="administrative-masters/employee-status-master/edit/:id"
        element={<AddEditEmployeeStatus user={user} />}
      />
      <Route
        path="administrative-masters/employee-status-master/view/:id"
        element={<ViewEmployeeStatus user={user} />}
      />
      <Route
        path="administrative-masters/employee-type-master"
        element={<EmpTypeList user={user} />}
      />
      <Route
        path="administrative-masters/employee-type-master/create"
        element={<AddEditEmpType user={user} />}
      />
      <Route
        path="administrative-masters/employee-type-master/edit/:id"
        element={<AddEditEmpType user={user} />}
      />
      <Route
        path="administrative-masters/employee-type-master/view/:id"
        element={<ViewEmpType user={user} />}
      />
      <Route
        path="administrative-masters/employee-quota-master"
        element={<EmpQuotaList user={user} />}
      />
      <Route
        path="administrative-masters/employee-quota-master/create"
        element={<AddEditEmpQuota user={user} />}
      />
      <Route
        path="administrative-masters/employee-quota-master/edit/:id"
        element={<AddEditEmpQuota user={user} />}
      />
      <Route
        path="administrative-masters/employee-quota-master/view/:id"
        element={<ViewEmpQuota EmpType user={user} />}
      />
      <Route
        path="administrative-masters/employee-category-master"
        element={<EmpCategoryList user={user} />}
      />
      <Route
        path="administrative-masters/employee-category-master/create"
        element={<AddEditEmpCategory user={user} />}
      />
      <Route
        path="administrative-masters/employee-category-master/edit/:id"
        element={<AddEditEmpCategory user={user} />}
      />
      <Route
        path="administrative-masters/employee-category-master/view/:id"
        element={<ViewEmpCategory EmpType user={user} />}
      />

      <Route
        path="administrative-masters/designation-master"
        element={<DesignationMaster user={user} />}
      />

      <Route
        path="administrative-masters/tax-slab/create"
        element={<AddEditTaxSlab user={user} />}
      />
      <Route
        path="administrative-masters/tax-slab/edit/:id"
        element={<AddEditTaxSlab user={user} />}
      />
      <Route
        path="administrative-masters/tax-slab/view/:id"
        element={<ViewTaxSlab EmpType user={user} />}
      />

      <Route
        path="administrative-masters/tax-slab"
        element={<TaxSlabList user={user} />}
      />

      <Route
        path="administrative-masters/city-hra-cla/create"
        element={<AddEditCityHra user={user} />}
      />
      <Route
        path="administrative-masters/city-hra-cla/edit/:id"
        element={<AddEditCityHra user={user} />}
      />
      <Route
        path="administrative-masters/city-hra-cla/view/:id"
        element={<ViewCityHra EmpType user={user} />}
      />

      <Route
        path="administrative-masters/city-hra-cla"
        element={<ListCityHra user={user} />}
      />

      {/* employee-records Route */}
      <Route
        path="employee-records/employee-master"
        element={<EmployeeMasterList user={user} />}
      />
      <Route
        path="employee-records/employee-master/create"
        element={<AddEditEmployeeMaster user={user} />}
      />
      <Route
        path="employee-records/employee-master/edit/:id"
        element={<AddEditEmployeeMaster user={user} />}
      />
      <Route
        path="employee-records/employee-master/view/:id"
        element={<ViewEmployeeMaster user={user} />}
      />
      <Route
        path="employee-records/employee-language-master"
        element={<EmpLanguageList user={user} />}
      />
      <Route
        path="employee-records/employee-language-master/create"
        element={<AddEditEmpLanguage user={user} />}
      />
      <Route
        path="employee-records/employee-language-master/edit/:id"
        element={<AddEditEmpLanguage user={user} />}
      />
      <Route
        path="employee-records/employee-language-master/view/:id"
        element={<ViewEmpLanguage user={user} />}
      />
      <Route
        path="employee-records/employee-qualification-details"
        element={<EmployeeEducationProfileList user={user} />}
      />
      <Route
        path="employee-records/employee-qualification-details/create"
        element={<AddEditEmployeeEducationProfile user={user} />}
      />
      <Route
        path="employee-records/employee-qualification-details/edit/:id"
        element={<AddEditEmployeeEducationProfile user={user} />}
      />
      <Route
        path="employee-records/employee-qualification-details/view/:id"
        element={<ViewEmployeeEducationProfile user={user} />}
      />

      <Route
        path="employee-records/emp-group-insurance"
        element={<EmpGroupInsuranceList user={user} />}
      />
      <Route
        path="employee-records/emp-group-insurance/create"
        element={<AddEditEmpGroupInsurance user={user} />}
      />
      <Route
        path="employee-records/emp-group-insurance/edit/:id"
        element={<AddEditEmpGroupInsurance user={user} />}
      />
      <Route
        path="employee-records/emp-group-insurance/view/:id"
        element={<ViewEmpGroupInsurance user={user} />}
      />

      <Route
        path="employee-records/emp-profile-update/create"
        element={<AddEmpProfileUpdate user={user} />}
      />
      <Route
        path="employee-records/emp-profile-update/edit/:id"
        element={<EditEmpProfileUpdate user={user} />}
      />
      <Route
        path="employee-records/emp-profile-update/history/:empId"
        element={<HistoryEmpProfileUpdate user={user} />}
      />
      <Route
        path="employee-records/emp-profile-update"
        element={<ListEmpProfileUpdate user={user} />}
      />
      <Route
        path="employee-records/emp-profile-update/view/:id"
        element={<ViewEmpProfileUpdate user={user} />}
      />

      {/* payroll-pay-structures Route */}

      <Route
        path="payroll-pay-structures/pay-matrix"
        element={<PayMatrixList user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-matrix/create"
        element={<AddEditPayMatrix user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-matrix/edit/:id"
        element={<AddEditPayMatrix user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-matrix/view/:id"
        element={<ViewPayMatrix user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-level"
        element={<PayLevelList user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-level/create"
        element={<AddEditPayLevel user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-level/edit/:id"
        element={<AddEditPayLevel user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-level/view/:id"
        element={<ViewPayLevel user={user} />}
      />
      <Route
        path="payroll-pay-structures/allowances-deductions-master"
        element={<PayAlwdedList user={user} />}
      />
      <Route
        path="payroll-pay-structures/allowances-deductions-master/create"
        element={<AddEditPayAlwded user={user} />}
      />
      <Route
        path="payroll-pay-structures/allowances-deductions-master/edit/:id"
        element={<AddEditPayAlwded user={user} />}
      />
      <Route
        path="payroll-pay-structures/allowances-deductions-master/view/:id"
        element={<ViewPayAlwded user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-structure-type-master"
        element={<PayStructureTypeList user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-structure-type-master/create"
        element={<AddEditPayStructureType user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-structure-type-master/edit/:id"
        element={<AddEditPayStructureType user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-structure-type-master/view/:id"
        element={<ViewPayStructureType user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-commission-master"
        element={<PayCommissionList user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-commission-master/create"
        element={<AddEditPayCommission user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-commission-master/edit/:id"
        element={<AddEditPayCommission user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-commission-master/view/:id"
        element={<ViewPayCommission user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-scale-master"
        element={<PayScaleList user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-scale-master/create"
        element={<AddEditPayScale user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-scale-master/edit/:id"
        element={<AddEditPayScale user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-scale-master/view/:id"
        element={<ViewPayScale user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-band-master"
        element={<PayBandList user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-band-master/create"
        element={<AddEditPayBand user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-band-master/edit/:id"
        element={<AddEditPayBand user={user} />}
      />
      <Route
        path="payroll-pay-structures/pay-band-master/view/:id"
        element={<ViewPayBand user={user} />}
      />
      <Route
        path="payroll-pay-structures/grade-pay-master"
        element={<GradeList user={user} />}
      />
      <Route
        path="payroll-pay-structures/grade-pay-master/create"
        element={<AddEditGrade user={user} />}
      />
      <Route
        path="payroll-pay-structures/grade-pay-master/edit/:id"
        element={<AddEditGrade user={user} />}
      />
      <Route
        path="payroll-pay-structures/grade-pay-master/view/:id"
        element={<ViewGrade user={user} />}
      />

      <Route
        path="payroll-pay-structures/ta-ma-rate-master"
        element={<TamarateList user={user} />}
      />
      <Route
        path="payroll-pay-structures/ta-ma-rate-master/create"
        element={<AddEditTamarate user={user} />}
      />
      <Route
        path="payroll-pay-structures/ta-ma-rate-master/edit/:id"
        element={<AddEditTamarate user={user} />}
      />
      <Route
        path="payroll-pay-structures/ta-ma-rate-master/view/:id"
        element={<ViewTamarate user={user} />}
      />

      <Route
        path="payroll-pay-structures/da-hra-ta-rate-master"
        element={<ListDaRate user={user} />}
      />
      <Route
        path="payroll-pay-structures/da-hra-ta-rate-master/create"
        element={<AddEditDaRate user={user} />}
      />
      <Route
        path="payroll-pay-structures/da-hra-ta-rate-master/edit/:id"
        element={<AddEditDaRate user={user} />}
      />
      <Route
        path="payroll-pay-structures/da-hra-ta-rate-master/view/:id"
        element={<ViewDaRate user={user} />}
      />
      <Route
        path="payroll-pay-structures/desg-pay-mapping"
        element={<ListDesgPayMapping user={user} />}
      />
      <Route
        path="payroll-pay-structures/desg-pay-mapping/create"
        element={<AddEditDesgPayMapping user={user} />}
      />
      <Route
        path="payroll-pay-structures/desg-pay-mapping/edit/:id"
        element={<AddEditDesgPayMapping user={user} />}
      />
      <Route
        path="payroll-pay-structures/desg-pay-mapping/view/:id"
        element={<ViewDesgPayMapping user={user} />}
      />

      {/* employee-personal-masters Route */}
      <Route
        path="employee-personal-masters/relationship-master"
        element={<RelationshipList user={user} />}
      />
      <Route
        path="employee-personal-masters/relationship-master/create"
        element={<AddEditRelationship user={user} />}
      />
      <Route
        path="employee-personal-masters/relationship-master/edit/:id"
        element={<AddEditRelationship user={user} />}
      />
      <Route
        path="employee-personal-masters/relationship-master/view/:id"
        element={<ViewRelationship user={user} />}
      />
      <Route
        path="employee-personal-masters/emp-family-info"
        element={<ListEmpFamilyInfo user={user} />}
      />
      <Route
        path="employee-personal-masters/emp-family-info/create"
        element={<AddEditEmpFamilyInfo user={user} />}
      />
      <Route
        path="employee-personal-masters/emp-family-info/edit/:id"
        element={<AddEditEmpFamilyInfo user={user} />}
      />
      <Route
        path="employee-personal-masters/emp-family-info/view/:id"
        element={<ViewEmpFamilyInfo user={user} />}
      />

      {/* performance-discipline-masters */}
      
      <Route
        path="performance-discipline-masters/special-duty"
        element={<SpecialDutyList user={user} />}
      />
      <Route
        path="performance-discipline-masters/special-duty/create"
        element={<AddEditSpecialDuty user={user} />}
      />
      <Route
        path="performance-discipline-masters/special-duty/edit/:id"
        element={<AddEditSpecialDuty user={user} />}
      />
      <Route
        path="performance-discipline-masters/special-duty/view/:id"
        element={<ViewSpecialDuty user={user} />}
      />
      <Route
        path="performance-discipline-masters/award"
        element={<AwardList user={user} />}
      />
      <Route
        path="performance-discipline-masters/award/create"
        element={<AddEditAward user={user} />}
      />
      <Route
        path="performance-discipline-masters/award/edit/:id"
        element={<AddEditAward user={user} />}
      />
      <Route
        path="performance-discipline-masters/award/view/:id"
        element={<ViewAward user={user} />}
      />

      <Route
        path="performance-discipline-masters/significant-work-master"
        element={<SigniWorkList user={user} />}
      />
      <Route
        path="performance-discipline-masters/significant-work-master/create"
        element={<AddEditSigniWork user={user} />}
      />
      <Route
        path="performance-discipline-masters/significant-work-master/edit/:id"
        element={<AddEditSigniWork user={user} />}
      />
      <Route
        path="performance-discipline-masters/significant-work-master/view/:id"
        element={<ViewSigniWork user={user} />}
      />
      <Route
        path="performance-discipline-masters/increment-exam-master"
        element={<IncExamList user={user} />}
      />
      <Route
        path="performance-discipline-masters/increment-exam-master/create"
        element={<AddEditIncExam user={user} />}
      />
      <Route
        path="performance-discipline-masters/increment-exam-master/edit/:id"
        element={<AddEditIncExam user={user} />}
      />
      <Route
        path="performance-discipline-masters/increment-exam-master/view/:id"
        element={<ViewIncExam user={user} />}
      />

      {/* financial-accounting Route */}

      {/* Bank chaque Route */}

      <Route
        path="financial-accounting/banks"
        element={<BanksList user={user} />}
      />
      <Route
        path="financial-accounting/banks/create"
        element={<AddEditbanks user={user} />}
      />
      <Route
        path="financial-accounting/banks/edit/:id"
        element={<AddEditbanks user={user} />}
      />
      <Route
        path="financial-accounting/banks/view/:id"
        element={<Viewbanks user={user} />}
      />

      <Route
        path="financial-accounting/bank-accounts"
        element={<BankAccountsList user={user} />}
      />
      <Route
        path="financial-accounting/bank-accounts/create"
        element={<AddEditBankAccounts user={user} />}
      />
      <Route
        path="financial-accounting/bank-accounts/edit/:id"
        element={<AddEditBankAccounts user={user} />}
      />
      <Route
        path="financial-accounting/bank-accounts/view/:id"
        element={<ViewBankAccounts user={user} />}
      />

      <Route
        path="financial-accounting/cheque-books"
        element={<ChequeBooksList user={user} />}
      />
      <Route
        path="financial-accounting/cheque-books/create"
        element={<AddEditChequeBooks user={user} />}
      />
      <Route
        path="financial-accounting/cheque-books/edit/:id"
        element={<AddEditChequeBooks user={user} />}
      />
      <Route
        path="financial-accounting/cheque-books/view/:id"
        element={<ViewChequeBooks user={user} />}
      />

      <Route
  path="financial-accounting/print-queues"
  element={<PrintQueuesList user={user} />}
/>
<Route
  path="financial-accounting/print-queues/create"
  element={<AddEditPrintQueues user={user} />}
/>
<Route
  path="financial-accounting/print-queues/edit/:id"
  element={<AddEditPrintQueues user={user} />}
/>
<Route
  path="financial-accounting/print-queues/view/:id"
  element={<ViewPrintQueues user={user} />}
/>

      <Route
        path="financial-accounting/cheques"
        element={<ChequesList user={user} />}
      />
      <Route
        path="financial-accounting/cheques/create"
        element={<AddEditCheques user={user} />}
      />
      <Route
        path="financial-accounting/cheques/edit/:id"
        element={<AddEditCheques user={user} />}
      />
      <Route
        path="financial-accounting/cheques/view/:id"
        element={<ViewCheques user={user} />}
      />

      <Route
        path="financial-accounting/cheque-formats"
        element={<ChequeFormatsList user={user} />}
      />
      <Route
        path="financial-accounting/cheque-formats/create"
        element={<AddEditChequeFormats user={user} />}
      />
      <Route
        path="financial-accounting/cheque-formats/edit/:id"
        element={<AddEditChequeFormats user={user} />}
      />
      <Route
        path="financial-accounting/cheque-formats/view/:id"
        element={<ViewChequeFormats user={user} />}
      />

      <Route
        path="financial-accounting/bank-account-authentication"
        element={<BankAuthList user={user} />}
      />
      <Route
        path="financial-accounting/bank-account-authentication/view/:id"
        element={<ViewBankAuth user={user} />}
      />

      <Route
        path="financial-accounting/vendortdsconfiguration-master"
        element={<VendorTDSConfigurationList user={user} />}
      />
      <Route
        path="financial-accounting/vendortdsconfiguration-master/create"
        element={<AddEditVendorTDSConfiguration user={user} />}
      />
      <Route
        path="financial-accounting/vendortdsconfiguration-master/edit/:id"
        element={<AddEditVendorTDSConfiguration user={user} />}
      />
      <Route
        path="financial-accounting/vendortdsconfiguration-master/view/:id"
        element={<ViewVendorTDSConfiguration user={user} />}
      />

      <Route
        path="financial-accounting/book-accounts"
        element={<BookAccountsList user={user} />}
      />
      <Route
        path="financial-accounting/book-accounts/create"
        element={<AddEditBookAccounts user={user} />}
      />
      <Route
        path="financial-accounting/book-accounts/edit/:id"
        element={<AddEditBookAccounts user={user} />}
      />
      <Route
        path="financial-accounting/book-accounts/view/:id"
        element={<ViewBookAccounts user={user} />}
      />
      <Route
        path="financial-accounting/ledger-accounts"
        element={<LedgerList user={user} />}
      />
      <Route
        path="financial-accounting/ledger-accounts/create"
        element={<AddEditLedger user={user} />}
      />
      <Route
        path="financial-accounting/ledger-accounts/edit/:id"
        element={<AddEditLedger user={user} />}
      />
      <Route
        path="financial-accounting/ledger-accounts/view/:id"
        element={<ViewLedger user={user} />}
      />

      <Route
        path="financial-accounting/vendor-register"
        element={<VerdorRegisterList user={user} />}
      />
      <Route
        path="financial-accounting/vendor-register/create"
        element={<AddEditVerdorRegister user={user} />}
      />
      <Route
        path="financial-accounting/vendor-register/edit/:id"
        element={<AddEditVerdorRegister user={user} />}
      />
      <Route
        path="financial-accounting/vendor-register/view/:id"
        element={<ViewVerdorRegister user={user} />}
      />

      <Route
        path="financial-accounting/vendor-check-register"
        element={<VendorBkCheckList user={user} />}
      />
      <Route
        path="financial-accounting/vendor-check-register/create"
        element={<AddEditVendorBkCheck user={user} />}
      />
      <Route
        path="financial-accounting/vendor-check-register/edit/:id"
        element={<AddEditVendorBkCheck user={user} />}
      />
      <Route
        path="financial-accounting/vendor-check-register/view/:id"
        element={<ViewVendorBkCheck user={user} />}
      />
      <Route
        path="financial-accounting/sub-ledger-accounts"
        element={<SubledgerAccountList user={user} />}
      />
      <Route
        path="financial-accounting/sub-ledger-accounts/create"
        element={<AddEditSubledgerAccount user={user} />}
      />
      <Route
        path="financial-accounting/sub-ledger-accounts/edit/:id"
        element={<AddEditSubledgerAccount user={user} />}
      />
      <Route
        path="financial-accounting/sub-ledger-accounts/view/:id"
        element={<ViewSubledgerAccount user={user} />}
      />
      <Route
        path="financial-accounting/ledger-grouping"
        element={<LedgerGrouping user={user} />}
      />
      <Route
        path="financial-accounting/budget-head-management"
        element={<BudgetHeadManagement user={user} />}
      />
      <Route
        path="financial-accounting/vendor-invoice-taxes"
        element={<VendorInvoiceTaxesList user={user} />}
      />
      <Route
        path="financial-accounting/vendor-invoice-taxes/create"
        element={<AddEditVendorInvoiceTaxes user={user} />}
      />
      <Route
        path="financial-accounting/vendor-invoice-taxes/edit/:id"
        element={<AddEditVendorInvoiceTaxes user={user} />}
      />
      <Route
        path="financial-accounting/vendor-invoice-taxes/view/:id"
        element={<ViewVendorInvoiceTaxes user={user} />}
      />
      <Route
        path="financial-accounting/invoice-tax-parameter"
        element={<InvoiceTaxParameterList user={user} />}
      />
      <Route
        path="financial-accounting/invoice-tax-parameter/create"
        element={<AddEditInvoiceTaxParameter user={user} />}
      />
      <Route
        path="financial-accounting/invoice-tax-parameter/edit/:id"
        element={<AddEditInvoiceTaxParameter user={user} />}
      />
      <Route
        path="financial-accounting/invoice-tax-parameter/view/:id"
        element={<ViewInvoiceTaxParameter user={user} />}
      />
      <Route
        path="financial-accounting/challan-tax-parameters"
        element={<ChallanTaxParameterList user={user} />}
      />
      <Route
        path="financial-accounting/challan-tax-parameters/create"
        element={<AddEditChallanTaxParameter user={user} />}
      />
      <Route
        path="financial-accounting/challan-tax-parameters/edit/:id"
        element={<AddEditChallanTaxParameter user={user} />}
      />
      <Route
        path="financial-accounting/challan-tax-parameters/view/:id"
        element={<ViewChallanTaxParameter user={user} />}
      />

      {/* construction-type routes */}

      {/* occupancy-status routes */}

      {/* payment-modes routes */}

      {/* doc-type-master routes */}

      {/* owner-master routes */}
      
      {/* property-master routes */}

      {/* prop-ownership routes */}

      {/* tax-type-master routes */}

      {/* tax-rate routes */}

      {/* rebate-master routes */}

      {/* penalty-master routes */}

      {/* collection-center routes */}

      {/* owner-docs routes */}
      {/* trans-demand entry routes */}
      {/* trans-demand approval routes */}
      {/* demand-rebate-trans entry routes */}

      {/* transaction-receipt entry routes */}
      {/* transaction-receipt approval routes */}

      {/* property-assessment entry routes */}
      {/* property-assessment approval routes */}

      {/* trans-grievance entry routes */}
      {/* trans-grievance approval routes */}
      
      {/* Transaction Notice Routes */}
      {/* Transaction Notice Approval Routes */}

      {/* Hall & Shop Management - Shop Categories */}
      <Route path="hall-shop-management/shop-categories" element={<ShopCategoryList user={user} />} />
      <Route path="hall-shop-management/shop-categories/create" element={<AddEditShopCategory user={user} />} />
      <Route path="hall-shop-management/shop-categories/edit/:id" element={<AddEditShopCategory user={user} />} />
      <Route path="hall-shop-management/shop-categories/view/:id" element={<ViewShopCategory user={user} />} />

      <Route path="hall-shop-management/shop-master" element={<ShopList user={user} />} />
      <Route path="hall-shop-management/shop-master/create" element={<AddEditShop user={user} />} />
      <Route path="hall-shop-management/shop-master/edit/:id" element={<AddEditShop user={user} />} />
      <Route path="hall-shop-management/shop-master/view/:id" element={<ViewShop user={user} />} />

      <Route path="hall-shop-management/shop-rental" element={<ShopRentalList user={user} />} />
      <Route path="hall-shop-management/shop-rental/create" element={<AddEditShopRental user={user} />} />
      <Route path="hall-shop-management/shop-rental/edit/:id" element={<AddEditShopRental user={user} />} />
      <Route path="hall-shop-management/shop-rental/view/:id" element={<ViewShopRental user={user} />} />

      <Route path="hall-shop-management/shop-rent-application" element={<ShopRentApplicationList user={user} />} />
      <Route path="hall-shop-management/shop-rent-application/create" element={<AddEditShopRentApplication user={user} />} />
      <Route path="hall-shop-management/shop-rent-application/edit/:id" element={<AddEditShopRentApplication user={user} />} />
      <Route path="hall-shop-management/shop-rent-application/view/:id" element={<ViewShopRentApplication user={user} />} />
      
      <Route path="hall-shop-management/shop-rent-application-approval" element={<ShopRentApplicationApprovalList user={user} />} />
      <Route path="hall-shop-management/shop-rent-application-approval/view/:id" element={<ShopRentApplicationApprovalView user={user} />} />
      
      <Route path="hall-shop-management/shop-rent-agreement" element={<ShopRentAgreementList user={user} />} />
      <Route path="hall-shop-management/shop-rent-agreement/create" element={<AddEditShopRentAgreement user={user} />} />
      <Route path="hall-shop-management/shop-rent-agreement/edit/:id" element={<AddEditShopRentAgreement user={user} />} />
      <Route path="hall-shop-management/seva-services" element={<SevaServices user={user} />} />
      <Route path="hall-shop-management/seva-service-kinds" element={<SevaServiceKinds user={user} />} />
      <Route path="hall-shop-management/seva-categories" element={<SevaCategoryMaster user={user} />} />
      <Route path="hall-shop-management/seva-packages" element={<SevaPackages user={user} />} />
      <Route path="hall-shop-management/seva-document-master" element={<SevaDocumentMaster user={user} />} />
      <Route path="hall-shop-management/seva-document-mapping" element={<SevaDocumentMapping user={user} />} />
      <Route path="hall-shop-management/seva-bookings" element={<SevaBookings user={user} />} />
      <Route path="hall-shop-management/seva-bookings-approval" element={<SevaApprovals user={user} />} />
      <Route path="hall-shop-management/seva-priests" element={<SevaPriests user={user} />} />
      <Route path="hall-shop-management/seva-organizers" element={<SevaOrganizers user={user} />} />
      <Route path="hall-shop-management/seva-action-master" element={<SevaActionMaster user={user} />} />

      <Route path="hall-shop-management/shop-rent-transaction" element={<ShopRentTransactionList user={user} />} />
      <Route path="hall-shop-management/shop-rent-transaction/create" element={<AddEditShopRentTransaction user={user} />} />
      <Route path="hall-shop-management/shop-rent-transaction/edit/:id" element={<AddEditShopRentTransaction user={user} />} />
      <Route path="hall-shop-management/shop-rent-transaction/view/:id" element={<ViewShopRentTransaction user={user} />} />

      <Route path="hall-shop-management/hall-category" element={<HallCategoryList user={user} />} />
      <Route path="hall-shop-management/hall-category/create" element={<AddEditHallCategory user={user} />} />
      <Route path="hall-shop-management/hall-category/edit/:id" element={<AddEditHallCategory user={user} />} />
      <Route path="hall-shop-management/hall-category/view/:id" element={<ViewHallCategory user={user} />} />

      <Route path="hall-shop-management/hall-master" element={<HallList user={user} />} />
      <Route path="hall-shop-management/hall-master/create" element={<AddEditHall user={user} />} />
      <Route path="hall-shop-management/hall-master/edit/:id" element={<AddEditHall user={user} />} />
      <Route path="hall-shop-management/hall-master/view/:id" element={<ViewHall user={user} />} />

      <Route path="hall-shop-management/hall-rental" element={<HallRentalList user={user} />} />
      <Route path="hall-shop-management/hall-rental/create" element={<AddEditHallRental user={user} />} />
      <Route path="hall-shop-management/hall-rental/edit/:id" element={<AddEditHallRental user={user} />} />
      <Route path="hall-shop-management/hall-rental/view/:id" element={<ViewHallRental user={user} />} />

      <Route path="hall-shop-management/hall-addon" element={<HallAddonList user={user} />} />
      <Route path="hall-shop-management/hall-addon/create" element={<AddEditHallAddon user={user} />} />
      <Route path="hall-shop-management/hall-addon/edit/:id" element={<AddEditHallAddon user={user} />} />
      <Route path="hall-shop-management/hall-addon/view/:id" element={<ViewHallAddon user={user} />} />

      <Route path="hall-shop-management/hall-rent-application" element={<HallRentApplicationList user={user} />} />
      <Route path="hall-shop-management/hall-rent-application/create" element={<AddEditHallRentApplication user={user} />} />
      <Route path="hall-shop-management/hall-rent-application/edit/:id" element={<AddEditHallRentApplication user={user} />} />
      <Route path="hall-shop-management/hall-rent-application/view/:id" element={<ViewHallRentApplication user={user} />} />

      <Route path="hall-shop-management/hall-rent-application-approval" element={<HallRentApplicationApprovalList user={user} />} />
      <Route path="hall-shop-management/hall-rent-application-approval/view/:id" element={<HallRentApplicationApprovalView user={user} />} />

      {/* Hall & Shop Management - Hall Rent Booking */}
      <Route path="hall-shop-management/hall-rent-booking" element={<HallRentBookingList user={user} />} />
      <Route path="hall-shop-management/hall-rent-booking/create" element={<AddEditHallRentBooking user={user} />} />
      <Route path="hall-shop-management/hall-rent-booking/edit/:id" element={<AddEditHallRentBooking user={user} />} />
      <Route path="hall-shop-management/hall-rent-booking/view/:id" element={<ViewHallRentBooking user={user} />} />

      <Route path="hall-shop-management/hall-rent-booking-approval" element={<HallRentBookingApprovalList user={user} />} />
      <Route path="hall-shop-management/hall-rent-booking-approval/view/:id" element={<HallRentBookingApprovalView user={user} />} />

    {/* Hall & Shop Management - Hall Rental Booking Addon */}
    <Route path="hall-shop-management/hall-rental-booking-addon" element={<HallRentalBookingAddonList user={user} />} />
    <Route path="hall-shop-management/hall-rental-booking-addon/create" element={<AddEditHallRentalBookingAddon user={user} />} />
    <Route path="hall-shop-management/hall-rental-booking-addon/edit/:id" element={<AddEditHallRentalBookingAddon user={user} />} />
    <Route path="hall-shop-management/hall-rental-booking-addon/view/:id" element={<ViewHallRentalBookingAddon user={user} />} />

    {/* Hall & Shop Management - Hall Rent Booking Transaction Approval */}
    <Route path="hall-shop-management/hall-rent-booking-transaction" element={<HallRentBookingTransactionList user={user} />} />
    <Route path="hall-shop-management/hall-rent-booking-transaction/create" element={<AddEditHallRentBookingTransaction user={user} />} />
    <Route path="hall-shop-management/hall-rent-booking-transaction/edit/:id" element={<AddEditHallRentBookingTransaction user={user} />} />
    <Route path="hall-shop-management/hall-rent-booking-transaction/view/:id" element={<ViewHallRentBookingTransaction user={user} />} />
    <Route path="hall-shop-management/hall-rent-booking-transaction-approval" element={<HallRentBookingTransactionApprovalList user={user} />} />
    <Route path="hall-shop-management/hall-rent-booking-transaction-approval/view/:id" element={<HallRentBookingTransactionApprovalView user={user} />} />

    </Routes>
  );
};

export default MasterRoutes;

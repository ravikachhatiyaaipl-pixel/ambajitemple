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
const OrganizationProfile = lazy(() => import("../settings/profilemanagement/organizationprofile/organizationprofile"));
const MenuMaster = lazy(() => import("../settings/menu-management/menu-master"));
const AddEditRoleMaster = lazy(() => import("../settings/user-management/user-role-master/addedit"));
const RoleMasterList = lazy(() => import("../settings/user-management/user-role-master/list"));
const ViewRoleMaster = lazy(() => import("../settings/user-management/user-role-master/view"));
const UserList = lazy(() => import("../settings/user-management/user-master/list"));
const AddEditUser = lazy(() => import("../settings/user-management/user-master/addedit"));
const ViewUser = lazy(() => import("../settings/user-management/user-master/view"));
const UserDepartmentMappingList = lazy(() => import("../settings/user-management/user-department-mapping/list"));
const AddEditUserDepartmentMapping = lazy(() => import("../settings/user-management/user-department-mapping/addedit"));
const ViewUserDepartmentMapping = lazy(() => import("../settings/user-management/user-department-mapping/view"));
const FinancialYearList = lazy(() => import("../settings/profilemanagement/financialyear/list"));
const AddEditFinancialYear = lazy(() => import("../settings/profilemanagement/financialyear/addedit"));
const ViewFinancialYear = lazy(() => import("../settings/profilemanagement/financialyear/view"));
const SystemParameters = lazy(() => import("../settings/edp-management/configuration/systemparameters"));
const AddEditDepartmentMenuMappings = lazy(() => import("../settings/menu-management/departmentmenumappings/addedit"));
const DepartmentMenuMappingsList = lazy(() => import("../settings/menu-management/departmentmenumappings/list"));
const ViewDepartmentMenuMappings = lazy(() => import("../settings/menu-management/departmentmenumappings/view"));
const BranchProfile = lazy(() => import("../settings/profilemanagement/branchprofile/branchprofile"));
const DeviceRegistrationApproval = lazy(() => import("../settings/edp-management/device-registration-approval/deviceregistrationapproval"));
const ActionMasterList = lazy(() => import("../settings/profilemanagement/action-master/list"));
const ViewActionMaster = lazy(() => import("../settings/profilemanagement/action-master/view"));
const AddEditActionMaster = lazy(() => import("../settings/profilemanagement/action-master/addedit"));
const KotakNameEnquiry = lazy(() => import("../settings/menu-management/banktest"));
const KotakPaymentDemo = lazy(() => import("../settings/menu-management/kotak-payment-demo"));
const GenVoucherMasterList = lazy(() => import("../settings/edp-management/configuration/gen-voucher-master/list"));
const AddEditGenVoucherMaster = lazy(() => import("../settings/edp-management/configuration/gen-voucher-master/addedit"));
const ViewGenVoucherMaster = lazy(() => import("../settings/edp-management/configuration/gen-voucher-master/view"));
const KotakConfigurationsList = lazy(() => import("../settings/edp-management/configuration/kotak-configurations/list"));
const AddEditKotakConfiguration = lazy(() => import("../settings/edp-management/configuration/kotak-configurations/addedit"));
const ViewKotakConfiguration = lazy(() => import("../settings/edp-management/configuration/kotak-configurations/view"));

const SettingsRoutes = ({ user }) => {
  return (
    <Routes>

      <Route
        path="menu-management/banktest"
        element={<KotakNameEnquiry user={user} />}
      />
      <Route
        path="menu-management/kotak-payment-demo"
        element={<KotakPaymentDemo user={user} />}
      />
      <Route
        path="profile-management/organization-profile"
        element={<OrganizationProfile user={user} />}
      />
      <Route
        path="profile-management/branch-profile"
        element={<BranchProfile user={user} />}
      />
      <Route
        path="menu-management/menu-master"
        element={<MenuMaster user={user} />}
      />

      <Route
        path="user-management/user-role-master"
        element={<RoleMasterList user={user} />}
      />
      <Route
        path="user-management/user-role-master/create"
        element={<AddEditRoleMaster user={user} />}
      />
      <Route
        path="user-management/user-role-master/edit/:id"
        element={<AddEditRoleMaster user={user} />}
      />
      <Route
        path="user-management/user-role-master/view/:id"
        element={<ViewRoleMaster user={user} />}
      />

      <Route
        path="user-management/user-master"
        element={<UserList user={user} />}
      />
      <Route
        path="user-management/user-master/create"
        element={<AddEditUser user={user} />}
      />
      <Route
        path="user-management/user-master/edit/:id"
        element={<AddEditUser user={user} />}
      />
      <Route
        path="user-management/user-master/view/:id"
        element={<ViewUser user={user} />}
      />
      <Route
        path="user-management/user-department-mapping"
        element={<UserDepartmentMappingList user={user} />}
      />
      <Route
        path="user-management/user-department-mapping/create"
        element={<AddEditUserDepartmentMapping user={user} />}
      />
      <Route
        path="user-management/user-department-mapping/edit/:id"
        element={<AddEditUserDepartmentMapping user={user} />}
      />
      <Route
        path="user-management/user-department-mapping/view/:id"
        element={<ViewUserDepartmentMapping user={user} />}
      />

      <Route
        path="profile-management/action-master"
        element={<ActionMasterList user={user} />}
      />
      <Route
        path="profile-management/action-master/create"
        element={<AddEditActionMaster user={user} />}
      />
      <Route
        path="profile-management/action-master/edit/:id"
        element={<AddEditActionMaster user={user} />}
      />
      <Route
        path="profile-management/action-master/view/:id"
        element={<ViewActionMaster user={user} />}
      />

      <Route
        path="profile-management/financial-year-master"
        element={<FinancialYearList user={user} />}
      />
      <Route
        path="profile-management/financial-year-master/create"
        element={<AddEditFinancialYear user={user} />}
      />
      <Route
        path="profile-management/financial-year-master/edit/:id"
        element={<AddEditFinancialYear user={user} />}
      />
      <Route
        path="profile-management/financial-year-master/view/:id"
        element={<ViewFinancialYear user={user} />}
      />
      {/* <Route
        path="/edp-management/device-registration-approval"
        element={<DeviceRegistrationApproval user={user} />}
      /> */}
      <Route
        path="/edp-management/configuration/system-parameters"
        element={<SystemParameters user={user} />}
      />
      <Route
        path="menu-management/branch-menu-mapping"
        element={<DepartmentMenuMappingsList user={user} />}
      />
      <Route
        path="menu-management/branch-menu-mapping/create"
        element={<AddEditDepartmentMenuMappings user={user} />}
      />
      <Route
        path="menu-management/branch-menu-mapping/edit/:id"
        element={<AddEditDepartmentMenuMappings user={user} />}
      />
      <Route
        path="menu-management/branch-menu-mapping/view/:id"
        element={<ViewDepartmentMenuMappings user={user} />}
      />

      {/* Generate Voucher Master */}
      <Route
        path="edp-management/configuration/generate-voucher-master"
        element={<GenVoucherMasterList user={user} />}
      />
      <Route
        path="edp-management/configuration/generate-voucher-master/create"
        element={<AddEditGenVoucherMaster user={user} />}
      />
      <Route
        path="edp-management/configuration/generate-voucher-master/edit/:id"
        element={<AddEditGenVoucherMaster user={user} />}
      />
      <Route
        path="edp-management/configuration/generate-voucher-master/view/:id"
        element={<ViewGenVoucherMaster user={user} />}
      />

      {/* Kotak Configurations */}
      <Route
        path="edp-management/configuration/kotak-configurations"
        element={<KotakConfigurationsList user={user} />}
      />
      <Route
        path="edp-management/configuration/kotak-configurations/create"
        element={<AddEditKotakConfiguration user={user} />}
      />
      <Route
        path="edp-management/configuration/kotak-configurations/edit/:id"
        element={<AddEditKotakConfiguration user={user} />}
      />
      <Route
        path="edp-management/configuration/kotak-configurations/view/:id"
        element={<ViewKotakConfiguration user={user} />}
      />
    </Routes>
  );
};

export default SettingsRoutes;

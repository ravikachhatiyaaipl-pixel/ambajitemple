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

import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../../components/layout";
const SettingsRoutes = lazy(() => import("./settingsroutes"));
const Dashboard = lazy(() => import("../admin-dashboard"));
const MasterRoutes = lazy(() => import("./masterroutes"));
const TransactionsRoutes = lazy(() => import("./transactionroutes"));
const ReportRoutes = lazy(() => import("./reportroutes"));
const UserProfile = lazy(() => import("../../pages/auth/user-profile"));
const EmployeeProfile = lazy(() => import("../auth/employee-profile"));
const DevoteeDashboard = lazy(() => import("../devotee-dashboard"));
const DevoteeDonationEntry = lazy(() => import("../devotee-donation-entry"));
const DevoteeDonations = lazy(() => import("../devotee-donations"));
const SevaPortal = lazy(() => import("../seva-portal"));
const ApplicantDashboard = lazy(() => import("../applicant-dashboard"));
const AdminDashboard = lazy(() => import("../admin-dashboard"));
import { amtAllRoutes } from "./amtallroutes";
const ReportStdRoutes = lazy(() => import("./reportstdroutes"));



const getHomeFor = (user) => {
  if (user?.isApplicant) return "/applicant-dashboard";
  if (user?.isDevotee) return "/devotee-dashboard";
  return "/dashboard";
};

const MainRoutes = ({ user, onLogout }) => {
  // Devotee / Applicant ke liye apna dashboard - koi sidebar/layout nahi
  if (user?.isPublicUser) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/applicant-dashboard" element={<ApplicantDashboard user={user} onLogout={onLogout} />} />
          <Route path="/devotee-dashboard" element={<DevoteeDashboard user={user} onLogout={onLogout} />} />
      <Route path="/devotee-donation-entry" element={<DevoteeDonationEntry user={user} onLogout={onLogout} />} />
      <Route path="/devotee-donations" element={<DevoteeDonations user={user} onLogout={onLogout} />} />
          <Route path="/seva-portal" element={<SevaPortal user={user} onLogout={onLogout} />} />
          <Route path="/login" element={<Navigate to={getHomeFor(user)} />} />
          <Route path="/registration" element={<Navigate to={getHomeFor(user)} />} />
          <Route path="*" element={<Navigate to={getHomeFor(user)} />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        }
      >
      <Routes>
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/devotee-dashboard" element={<DevoteeDashboard user={user} onLogout={onLogout} />} />
      <Route path="/devotee-donation-entry" element={<DevoteeDonationEntry user={user} onLogout={onLogout} />} />
      <Route path="/devotee-donations" element={<DevoteeDonations user={user} onLogout={onLogout} />} />
          <Route path="/seva-portal" element={<SevaPortal user={user} onLogout={onLogout} />} />
        <Route path="/applicant-dashboard" element={<ApplicantDashboard user={user} onLogout={onLogout} />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-profile" element={<UserProfile  user={user} />} />
        <Route path="/employee-profile" element={<EmployeeProfile  user={user} />} />
        <Route path="/settings/*" element={<SettingsRoutes user={user} />} />

        <Route path="/reports-std/*" element={<ReportStdRoutes user={user} />} />

        {amtAllRoutes(user)}

        <Route path="/masters/*" element={<MasterRoutes user={user} />} />

        <Route path="/transactions/*" element={<TransactionsRoutes user={user} />} />

        <Route path="/reports/*" element={<ReportRoutes user={user} />} />

        <Route path="/" element={<Navigate to={getHomeFor(user)} />} />

        {/* Public users (devotee / applicant) ko unke apne dashboard bhejo */}
        <Route
          path="/home"
          element={<Navigate to={getHomeFor(user)} />}
        />

        <Route path="*" element={<Navigate to={getHomeFor(user)} />} />
      </Routes>
      </Suspense>
    </Layout>
  );
};

export default MainRoutes;
